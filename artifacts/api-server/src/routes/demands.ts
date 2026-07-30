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

// ── Protocol generation ───────────────────────────────────────────────────────

function generateProtocol(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `VUNDF-${dateStr}-${suffix}`;
}

/** Detect PostgreSQL unique-constraint violation (code 23505) on the protocol column. */
function isProtocolCollision(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const pg = err as Record<string, unknown>;
  if (pg["code"] !== "23505") return false;
  // Only treat it as a protocol collision — not other unique constraints
  const constraint = String(pg["constraint"] ?? pg["constraintName"] ?? "");
  const detail = String(pg["detail"] ?? "");
  return (
    constraint.includes("protocol") ||
    detail.includes("protocol") ||
    detail.includes("demands_protocol")
  );
}

type DemandInsert = Parameters<typeof db.insert>[0] extends typeof demands
  ? typeof demands.$inferInsert
  : never;

/**
 * Insere uma demanda gerando um protocolo único.
 * Em caso de colisão 23505 no protocolo, tenta novamente (máx. 5 vezes).
 * Após 5 falhas, lança um erro 503 com mensagem segura.
 */
async function insertDemandWithUniqueProtocol(
  data: Omit<typeof demands.$inferInsert, "protocol">,
): Promise<typeof demands.$inferSelect> {
  const MAX_ATTEMPTS = 5;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const protocol = generateProtocol();
    try {
      const [demand] = await db
        .insert(demands)
        .values({ ...data, protocol })
        .returning();
      return demand;
    } catch (err: unknown) {
      if (isProtocolCollision(err)) {
        if (attempt === MAX_ATTEMPTS) {
          const serviceErr = new Error(
            "Não foi possível gerar um protocolo único. Tente novamente em instantes.",
          );
          (serviceErr as NodeJS.ErrnoException).code = "PROTOCOL_COLLISION_EXHAUSTED";
          throw serviceErr;
        }
        // retry
        continue;
      }
      // Rethrow non-protocol errors immediately
      throw err;
    }
  }

  // Unreachable; TypeScript requires a return path
  throw new Error("insertDemandWithUniqueProtocol: loop exited unexpectedly");
}

// ── Public DTO ────────────────────────────────────────────────────────────────

/**
 * Converte uma demanda do banco em resposta pública segura.
 *
 * NUNCA retorna: userId, mediaUrl, latitude, longitude, endereço completo (se anônimo),
 * identificadores internos, dados do autor, e-mail, matrícula, avatar,
 * observações internas ou notas administrativas.
 */
export function toPublicDemandResponse(
  demand: typeof demands.$inferSelect & { userSupported?: boolean },
) {
  return {
    id: demand.id,
    protocol: demand.protocol,
    type: demand.type,
    category: demand.category,
    status: demand.status,
    supportCount: demand.supportCount,
    isAnonymous: demand.isAnonymous,
    createdAt: demand.createdAt,
    updatedAt: demand.updatedAt,
    // Content — never null for text demands
    content: demand.content ?? null,
    // Target unit — publicly visible
    targetUnit: demand.targetUnit ?? null,
    // Address — omit entirely for anonymous demands
    address: demand.isAnonymous ? null : (demand.address ?? null),
    // Institutional response — publicly visible
    adminResponse: demand.adminResponse ?? null,
    // Whether the authenticated user has supported this demand
    userSupported: demand.userSupported ?? false,
    // NOTE: the following fields are intentionally excluded from this object:
    //   userId, mediaUrl, latitude, longitude,
    //   internalNotes, adminNotes, authorEmail, authorAvatar, authorEnrollment
  };
}

// ── GET /demands — Listagem pública ──────────────────────────────────────────

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

  const orderBy =
    sort === "supportCount" ? desc(demands.supportCount) : desc(demands.createdAt);

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(demands).where(and(...conditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ total: count() }).from(demands).where(and(...conditions)),
  ]);

  res.json({
    data: rows.map(toPublicDemandResponse),
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// ── POST /demands — Criar demanda (requer auth) ───────────────────────────────

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

  try {
    const demand = await insertDemandWithUniqueProtocol({
      ...input,
      userId: req.user.id,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      address: input.address ?? null,
      content: input.content ?? null,
      mediaUrl: input.mediaUrl ?? null,
      targetUnit: input.targetUnit ?? null,
    });

    req.log.info({ protocol: demand.protocol, category: demand.category }, "demand.created");
    res.status(201).json(toPublicDemandResponse(demand));
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err as NodeJS.ErrnoException).code === "PROTOCOL_COLLISION_EXHAUSTED"
    ) {
      res.status(503).json({
        message: "Não foi possível gerar um protocolo único. Tente novamente em instantes.",
      });
      return;
    }
    throw err;
  }
});

// ── GET /demands/protocol/:protocol — Consulta por protocolo (público) ────────

router.get("/demands/protocol/:protocol", async (req: Request, res: Response) => {
  const rawProtocol = String(req.params.protocol);

  // Normalizar para maiúsculas
  const protocol = rawProtocol.trim().toUpperCase();

  // Validar formato VUNDF-YYYYMMDD-XXXX
  if (!/^VUNDF-\d{8}-\d{4}$/.test(protocol)) {
    res.status(400).json({ message: "Formato de protocolo inválido. Use VUNDF-YYYYMMDD-XXXX." });
    return;
  }

  const [demand] = await db.select().from(demands).where(eq(demands.protocol, protocol));

  if (!demand) {
    // 404 genérico — não revela se o protocolo existe como privado
    res.status(404).json({ message: "Protocolo não encontrado." });
    return;
  }

  // Não retornar anexos ou áudio via consulta pública de protocolo
  let userSupported = false;
  if (req.isAuthenticated()) {
    const [support] = await db
      .select()
      .from(demandSupports)
      .where(and(eq(demandSupports.demandId, demand.id), eq(demandSupports.userId, req.user.id)));
    userSupported = !!support;
  }

  res.json(toPublicDemandResponse({ ...demand, userSupported }));
});

// ── POST /demands/:id/support — Toggle apoio (requer auth) ───────────────────

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

// ── GET /admin/demands — Listagem administrativa ──────────────────────────────

router.get(
  "/admin/demands",
  requireRole(["gestor", "administrador"]),
  async (req: Request & { user: NonNullable<Request["user"]> }, res: Response) => {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const limit = parseInt(String(req.query.limit ?? "50"), 10);
    const status = req.query.status as string | undefined;
    const offset = (page - 1) * limit;

    const conditions = status
      ? [eq(demands.status, status as typeof DEMAND_STATUSES[number])]
      : [];

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(demands)
        .where(and(...conditions))
        .orderBy(desc(demands.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(demands).where(and(...conditions)),
    ]);

    // Admin view — retorna dados completos (incluindo campos internos)
    res.json({
      data: rows,
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
    });
  },
);

// ── PATCH /admin/demands/:id/status — Atualizar status ───────────────────────

router.patch(
  "/admin/demands/:id/status",
  requireRole(["gestor", "administrador"]),
  async (req: Request & { user: NonNullable<Request["user"]> }, res: Response) => {
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
      .set({
        status: parsed.data.status,
        adminResponse: parsed.data.adminResponse ?? null,
        updatedAt: new Date(),
      })
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
  },
);

// ── GET /demands/:id/history — Histórico (público) ───────────────────────────

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
