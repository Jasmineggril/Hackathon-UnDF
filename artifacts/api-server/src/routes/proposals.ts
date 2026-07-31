/**
 * @module routes/proposals
 * @description Rotas de Propostas Formais da comunidade acadêmica UnDF.
 *
 * Autorização:
 * - Leitura (GET): pública
 * - Criação (POST): requer autenticação
 * - Apoio (POST /:id/support): requer autenticação
 * - Admin (GET /admin, PATCH /admin/:id/status): requer role gestor/administrador
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { proposals, proposalSupports, PROPOSAL_STATUSES, DEMAND_CATEGORIES } from "@workspace/db";
import { ListProposalsQueryParams, CreateProposalBody } from "@workspace/api-zod";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { requireRole } from "../middlewares/authMiddleware";

const router: IRouter = Router();

const UpdateProposalStatusBody = z.object({
  status: z.enum(PROPOSAL_STATUSES),
  adminDecision: z.string().nullish(),
});

// GET /proposals — Listagem pública
router.get("/proposals", async (req: Request, res: Response) => {
  const parsed = ListProposalsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros inválidos" });
    return;
  }

  const { category, status, page = 1, limit = 20, sort = "supportCount" } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [
    ...(status ? [eq(proposals.status, status)] : []),
    ...(category ? [eq(proposals.category, category as typeof DEMAND_CATEGORIES[number])] : []),
  ];

  const orderBy = sort === "createdAt"
    ? desc(proposals.createdAt)
    : desc(proposals.supportCount);

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(proposals).where(and(...conditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ total: count() }).from(proposals).where(and(...conditions)),
  ]);

  const sanitized = rows.map(({ userId, ...p }) => p);

  res.json({
    data: sanitized,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// POST /proposals — Submeter proposta (requer auth)
router.post("/proposals", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Autenticação necessária para submeter uma proposta." });
    return;
  }

  const parsed = CreateProposalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: parsed.error.errors[0]?.message ?? "Dados inválidos",
      field: parsed.error.errors[0]?.path.join("."),
    });
    return;
  }

  const [proposal] = await db
    .insert(proposals)
    .values({
      ...parsed.data,
      userId: req.user.id,
      targetUnit: parsed.data.targetUnit ?? null,
    })
    .returning();

  req.log.info({ id: proposal.id, category: proposal.category }, "proposal.created");
  const { userId, ...sanitized } = proposal;
  res.status(201).json(sanitized);
});

// GET /proposals/:id — Detalhe público de uma proposta
router.get("/proposals/:id", async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }
  const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
  if (!proposal) {
    res.status(404).json({ message: "Proposta não encontrada." });
    return;
  }
  const { userId, ...sanitized } = proposal;
  res.json(sanitized);
});

// POST /proposals/:id/support — Toggle apoio (requer auth)
router.post("/proposals/:id/support", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Autenticação necessária para apoiar uma proposta." });
    return;
  }

  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  const [proposal] = await db
    .select({ id: proposals.id, supportCount: proposals.supportCount })
    .from(proposals)
    .where(eq(proposals.id, id));

  if (!proposal) {
    res.status(404).json({ message: "Proposta não encontrada." });
    return;
  }

  const [existing] = await db
    .select()
    .from(proposalSupports)
    .where(and(eq(proposalSupports.proposalId, id), eq(proposalSupports.userId, req.user.id)));

  let supported: boolean;
  let newCount: number;

  if (existing) {
    await db.delete(proposalSupports).where(
      and(eq(proposalSupports.proposalId, id), eq(proposalSupports.userId, req.user.id)),
    );
    const [updated] = await db
      .update(proposals)
      .set({ supportCount: sql`GREATEST(${proposals.supportCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning({ supportCount: proposals.supportCount });
    supported = false;
    newCount = updated.supportCount;
  } else {
    await db.insert(proposalSupports).values({ proposalId: id, userId: req.user.id });
    const [updated] = await db
      .update(proposals)
      .set({ supportCount: sql`${proposals.supportCount} + 1`, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning({ supportCount: proposals.supportCount });
    supported = true;
    newCount = updated.supportCount;
  }

  res.json({ supported, supportCount: newCount });
});

// GET /admin/proposals — Listagem administrativa (gestor/administrador)
router.get("/admin/proposals", requireRole(["gestor", "administrador"]), async (req: Request & { user: NonNullable<Request["user"]> }, res: Response) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "50"), 10);
  const status = req.query.status as string | undefined;
  const offset = (page - 1) * limit;

  const conditions = status
    ? [eq(proposals.status, status as typeof PROPOSAL_STATUSES[number])]
    : [];

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(proposals).where(and(...conditions)).orderBy(desc(proposals.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(proposals).where(and(...conditions)),
  ]);

  res.json({
    data: rows,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// PATCH /admin/proposals/:id/status — Atualizar status (gestor/administrador)
router.patch("/admin/proposals/:id/status", requireRole(["gestor", "administrador"]), async (req: Request & { user: NonNullable<Request["user"]> }, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  const parsed = UpdateProposalStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Dados inválidos" });
    return;
  }

  const [current] = await db
    .select({ status: proposals.status })
    .from(proposals)
    .where(eq(proposals.id, id));

  if (!current) {
    res.status(404).json({ message: "Proposta não encontrada." });
    return;
  }

  const [updated] = await db
    .update(proposals)
    .set({
      status: parsed.data.status,
      adminDecision: parsed.data.adminDecision ?? null,
      updatedAt: new Date(),
    })
    .where(eq(proposals.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ message: "Proposta não encontrada." });
    return;
  }

  req.log.info({ id, status: parsed.data.status }, "proposal.status_updated");
  const { userId, ...sanitized } = updated;
  res.json(sanitized);
});

export default router;
