/**
 * @module routes/user
 * @description Endpoints de dados do usuário autenticado — Voz UnDF.
 *
 * Todas as rotas requerem autenticação.
 * O usuário só acessa dados próprios — nenhum dado de terceiros é exposto.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  demands,
  proposals,
  demandSupports,
  proposalSupports,
  users,
} from "@workspace/db";
import { eq, desc, and, count, sql } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Autenticação necessária." });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// GET /api/user/stats — Resumo do painel do usuário
// ---------------------------------------------------------------------------
router.get("/user/stats", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const userId = req.user!.id;

  const [
    demandStats,
    proposalCount,
    supportedCount,
  ] = await Promise.all([
    // Contagem de demandas por status
    db
      .select({ status: demands.status, count: count() })
      .from(demands)
      .where(eq(demands.userId, userId))
      .groupBy(demands.status),

    // Total de propostas
    db
      .select({ count: count() })
      .from(proposals)
      .where(eq(proposals.userId, userId)),

    // Total de demandas apoiadas
    db
      .select({ count: count() })
      .from(demandSupports)
      .where(eq(demandSupports.userId, userId)),
  ]);

  const demandTotal = demandStats.reduce((sum, s) => sum + Number(s.count), 0);
  const demandInProgress = demandStats
    .filter((s) => ["received", "in_analysis", "processing", "awaiting_info", "escalated"].includes(s.status))
    .reduce((sum, s) => sum + Number(s.count), 0);
  const demandAnswered = demandStats
    .filter((s) => ["completed", "rejected"].includes(s.status))
    .reduce((sum, s) => sum + Number(s.count), 0);

  // Último protocolo criado pelo usuário
  const [lastDemand] = await db
    .select({ protocol: demands.protocol, status: demands.status, updatedAt: demands.updatedAt })
    .from(demands)
    .where(eq(demands.userId, userId))
    .orderBy(desc(demands.createdAt))
    .limit(1);

  res.json({
    demandTotal,
    demandInProgress,
    demandAnswered,
    proposalTotal: Number(proposalCount[0]?.count ?? 0),
    supportedTotal: Number(supportedCount[0]?.count ?? 0),
    lastProtocol: lastDemand ?? null,
    lastUpdatedAt: lastDemand?.updatedAt ?? null,
  });
});

// ---------------------------------------------------------------------------
// GET /api/user/demands — Demandas do usuário autenticado
// ---------------------------------------------------------------------------
router.get("/user/demands", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const userId = req.user!.id;
  const status = req.query.status as string | undefined;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
  const offset = (page - 1) * limit;

  const conditions = [
    eq(demands.userId, userId),
    ...(status && status !== "all" ? [sql`${demands.status} = ${status}`] : []),
  ] as const;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(demands)
      .where(and(...conditions))
      .orderBy(desc(demands.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(demands)
      .where(and(...conditions)),
  ]);

  res.json({
    data: rows,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// ---------------------------------------------------------------------------
// GET /api/user/proposals — Propostas do usuário autenticado
// ---------------------------------------------------------------------------
router.get("/user/proposals", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const userId = req.user!.id;
  const status = req.query.status as string | undefined;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
  const offset = (page - 1) * limit;

  const conditions = [
    eq(proposals.userId, userId),
    ...(status && status !== "all" ? [sql`${proposals.status} = ${status}`] : []),
  ] as const;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(proposals)
      .where(and(...conditions))
      .orderBy(desc(proposals.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(proposals)
      .where(and(...conditions)),
  ]);

  res.json({
    data: rows,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// ---------------------------------------------------------------------------
// GET /api/user/supported-demands — Demandas apoiadas pelo usuário
// ---------------------------------------------------------------------------
router.get("/user/supported-demands", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const userId = req.user!.id;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
  const offset = (page - 1) * limit;

  // Join demandSupports → demands
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: demands.id,
        protocol: demands.protocol,
        type: demands.type,
        category: demands.category,
        content: demands.content,
        status: demands.status,
        supportCount: demands.supportCount,
        isAnonymous: demands.isAnonymous,
        targetUnit: demands.targetUnit,
        createdAt: demands.createdAt,
        updatedAt: demands.updatedAt,
        supportedAt: demandSupports.createdAt,
      })
      .from(demandSupports)
      .innerJoin(demands, eq(demandSupports.demandId, demands.id))
      .where(eq(demandSupports.userId, userId))
      .orderBy(desc(demandSupports.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(demandSupports)
      .where(eq(demandSupports.userId, userId)),
  ]);

  res.json({
    data: rows,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// ---------------------------------------------------------------------------
// GET /api/user/supported-proposals — IDs de propostas apoiadas pelo usuário
// ---------------------------------------------------------------------------
router.get("/user/supported-proposals", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const userId = req.user!.id;
  const rows = await db
    .select({ proposalId: proposalSupports.proposalId })
    .from(proposalSupports)
    .where(eq(proposalSupports.userId, userId));
  res.json({ ids: rows.map((r) => r.proposalId) });
});

// ---------------------------------------------------------------------------
// DELETE /api/user/supported-demands/:demandId — Retirar apoio
// ---------------------------------------------------------------------------
router.delete("/user/supported-demands/:demandId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const userId = req.user!.id;
  const demandId = parseInt(String(req.params.demandId), 10);
  if (isNaN(demandId)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  const [existing] = await db
    .select()
    .from(demandSupports)
    .where(and(eq(demandSupports.demandId, demandId), eq(demandSupports.userId, userId)));

  if (!existing) {
    res.status(404).json({ message: "Apoio não encontrado." });
    return;
  }

  await db
    .delete(demandSupports)
    .where(and(eq(demandSupports.demandId, demandId), eq(demandSupports.userId, userId)));

  await db
    .update(demands)
    .set({ supportCount: sql`GREATEST(${demands.supportCount} - 1, 0)`, updatedAt: new Date() })
    .where(eq(demands.id, demandId));

  res.json({ ok: true });
});

export default router;
