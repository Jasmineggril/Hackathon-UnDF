/**
 * @module routes/demands
 * @description Rotas de Demandas da plataforma Voz UnDF.
 *
 * Arquitetura de autorização:
 * - Leitura (GET): pública
 * - Escrita (POST): requer autenticação
 * - Apoio (POST /:id/support): requer autenticação
 * - Admin (GET /admin, PATCH /admin/:id/status): requer role gestor/administrador
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  demands,
  demandSupports,
  DEMAND_CATEGORIES,
  DEMAND_STATUSES,
} from "@workspace/db";
import {
  ListDemandsQueryParams,
  CreateDemandBody,
  UpdateDemandStatusBody,
} from "@workspace/api-zod";
import { eq, desc, asc, and, sql, count } from "drizzle-orm";
import { demandStatusHistory } from "@workspace/db";
import { requireRole } from "../middlewares/authMiddleware";

const router: IRouter = Router();

function generateProtocol(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${dateStr}-${suffix}`;
}

function sanitizeForPublic(demand: typeof demands.$inferSelect & { userSupported?: boolean }) {
  const { userId, latitude, longitude, ...base } = demand;
  if (demand.isAnonymous) {
    return { ...base, address: null, userSupported: demand.userSupported ?? false };
  }
  return { ...base, userSupported: demand.userSupported ?? false };
}

// GET /demands — Listagem pública
router.get("/demands", async (req: Request, res: Response) => {
  const parsed = ListDemandsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros inválidos", errors: parsed.error.flatten() });
    return;
  }

  const { category, status, page = 1, limit = 20, sort = "createdAt" } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [
    ...(status ? [eq(demands.status, status)] : [sql`${demands.status} != 'archived'`]),
    ...(category ? [eq(demands.category, category as typeof DEMAND_CATEGORIES[number])] : []),
  ];

  const orderBy = sort === "supportCount"
    ? desc(demands.supportCount)
    : desc(demands.createdAt);

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(demands).where(and(...conditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ total: count() }).from(demands).where(and(...conditions)),
  ]);

  res.json({
    data: rows.map(sanitizeForPublic),
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// POST /demands — Criar demanda (requer auth)
router.post("/demands", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Autenticação necessária para registrar uma demanda." });
    return;
  }

  const parsed = CreateDemandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: parsed.error.errors[0]?.message ?? "Dados inválidos",
      field: parsed.error.errors[0]?.path.join("."),
    });
    return;
  }

  const input = parsed.data;

  if (input.type === "text" && !input.content?.trim()) {
    res.status(400).json({ message: "Descreva sua demanda.", field: "content" });
    return;
  }

  let protocol = generateProtocol();
  const [existing] = await db.select({ id: demands.id }).from(demands).where(eq(demands.protocol, protocol));
  if (existing) protocol = generateProtocol();

  const [demand] = await db
    .insert(demands)
    .values({
      ...input,
      protocol,
      userId: req.user.id,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      address: input.address ?? null,
      content: input.content ?? null,
      mediaUrl: input.mediaUrl ?? null,
      targetUnit: input.targetUnit ?? null,
    })
    .returning();

  req.log.info({ protocol: demand.protocol, category: demand.category }, "demand.created");
  res.status(201).json(sanitizeForPublic(demand));
});

// GET /demands/protocol/:protocol — Consulta por protocolo (público)
router.get("/demands/protocol/:protocol", async (req: Request, res: Response) => {
  const protocol = String(req.params.protocol);
  const [demand] = await db.select().from(demands).where(eq(demands.protocol, protocol));

  if (!demand) {
    res.status(404).json({ message: "Protocolo não encontrado." });
    return;
  }

  let userSupported = false;
  if (req.isAuthenticated()) {
    const [support] = await db
      .select()
      .from(demandSupports)
      .where(and(eq(demandSupports.demandId, demand.id), eq(demandSupports.userId, req.user.id)));
    userSupported = !!support;
  }

  res.json(sanitizeForPublic({ ...demand, userSupported }));
});

// POST /demands/:id/support — Toggle apoio (requer auth)
router.post("/demands/:id/support", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Autenticação necessária para apoiar uma demanda." });
    return;
  }

  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  const [demand] = await db
    .select({ id: demands.id, supportCount: demands.supportCount })
    .from(demands)
    .where(eq(demands.id, id));

  if (!demand) {
    res.status(404).json({ message: "Demanda não encontrada." });
    return;
  }

  const [existingSupport] = await db
    .select()
    .from(demandSupports)
    .where(and(eq(demandSupports.demandId, id), eq(demandSupports.userId, req.user.id)));

  let supported: boolean;
  let newCount: number;

  if (existingSupport) {
    await db.delete(demandSupports).where(
      and(eq(demandSupports.demandId, id), eq(demandSupports.userId, req.user.id)),
    );
    const [updated] = await db
      .update(demands)
      .set({ supportCount: sql`GREATEST(${demands.supportCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(demands.id, id))
      .returning({ supportCount: demands.supportCount });
    supported = false;
    newCount = updated.supportCount;
  } else {
    await db.insert(demandSupports).values({ demandId: id, userId: req.user.id });
    const [updated] = await db
      .update(demands)
      .set({ supportCount: sql`${demands.supportCount} + 1`, updatedAt: new Date() })
      .where(eq(demands.id, id))
      .returning({ supportCount: demands.supportCount });
    supported = true;
    newCount = updated.supportCount;
  }

  res.json({ supported, supportCount: newCount });
});

// GET /admin/demands — Listagem administrativa
router.get("/admin/demands", requireRole(["gestor", "administrador"]), async (req: Request & { user: NonNullable<Request['user']> }, res: Response) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "50"), 10);
  const status = req.query.status as string | undefined;
  const offset = (page - 1) * limit;

  const conditions = status ? [eq(demands.status, status as typeof DEMAND_STATUSES[number])] : [];

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(demands).where(and(...conditions)).orderBy(desc(demands.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(demands).where(and(...conditions)),
  ]);

  res.json({
    data: rows,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// PATCH /admin/demands/:id/status — Atualizar status
router.patch("/admin/demands/:id/status", requireRole(["gestor", "administrador"]), async (req: Request & { user: NonNullable<Request['user']> }, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  const parsed = UpdateDemandStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Dados inválidos" });
    return;
  }

  const [current] = await db.select({ status: demands.status }).from(demands).where(eq(demands.id, id));
  if (!current) {
    res.status(404).json({ message: "Demanda não encontrada." });
    return;
  }

  const [updated] = await db
    .update(demands)
    .set({ status: parsed.data.status, adminResponse: parsed.data.adminResponse ?? null, updatedAt: new Date() })
    .where(eq(demands.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ message: "Demanda não encontrada." });
    return;
  }

  await db.insert(demandStatusHistory).values({
    demandId: id,
    previousStatus: current.status,
    newStatus: parsed.data.status,
    adminResponse: parsed.data.adminResponse ?? null,
    changedBy: req.user.id,
  });

  req.log.info({ id, status: parsed.data.status }, "demand.status_updated");
  res.json(updated);
});

// GET /demands/:id/history — Histórico (público)
router.get("/demands/:id/history", async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  const history = await db
    .select()
    .from(demandStatusHistory)
    .where(eq(demandStatusHistory.demandId, id))
    .orderBy(asc(demandStatusHistory.createdAt));

  res.json(history);
});

export default router;
