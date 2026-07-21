/**
 * @module routes/transparency
 * @description Rotas do Portal de Transparência da UnDF Participa.
 *
 * Todos os endpoints são públicos e fornecem dados agregados reais do banco.
 * Nenhum dado individual ou PII é exposto — apenas contagens e métricas.
 *
 * Alinhamento com ODS 16 (Paz, Justiça e Instituições Eficazes):
 * - Indicadores de participação demonstram acesso efetivo à gestão.
 * - Taxa de resolução evidencia capacidade de resposta institucional.
 * - Série temporal permite auditoria pública da evolução ao longo do tempo.
 *
 * Decisão de performance: queries de transparência podem ser custosas.
 * Para produção, considerar cache em Redis com TTL de 5 minutos.
 * Na versão atual (MVP), executadas diretamente — volume esperado é baixo.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { demands, proposals, users } from "@workspace/db";
import { eq, sql, count, avg } from "drizzle-orm";

const router: IRouter = Router();

const STATUS_LABELS: Record<string, string> = {
  received: "Recebida",
  processing: "Em Análise",
  completed: "Concluída",
  archived: "Arquivada",
};

// ---------------------------------------------------------------------------
// GET /transparency/stats — Indicadores gerais de participação
// ---------------------------------------------------------------------------
router.get("/transparency/stats", async (_req: Request, res: Response) => {
  const [
    [demandsStats],
    [proposalsStats],
    [usersCount],
  ] = await Promise.all([
    db
      .select({
        total: count(),
        resolved: sql<number>`COUNT(*) FILTER (WHERE ${demands.status} = 'completed')`,
        inProgress: sql<number>`COUNT(*) FILTER (WHERE ${demands.status} = 'processing')`,
        received: sql<number>`COUNT(*) FILTER (WHERE ${demands.status} = 'received')`,
      })
      .from(demands),
    db
      .select({
        total: count(),
        approved: sql<number>`COUNT(*) FILTER (WHERE ${proposals.status} IN ('approved', 'implemented'))`,
      })
      .from(proposals),
    db.select({ total: count() }).from(users),
  ]);

  res.json({
    totalDemands: Number(demandsStats.total),
    demandsResolved: Number(demandsStats.resolved),
    demandsInProgress: Number(demandsStats.inProgress),
    demandsReceived: Number(demandsStats.received),
    totalProposals: Number(proposalsStats.total),
    proposalsApproved: Number(proposalsStats.approved),
    avgResolutionDays: null, // Calculado quando houver dados suficientes
    totalParticipants: Number(usersCount.total),
  });
});

// ---------------------------------------------------------------------------
// GET /transparency/demands-by-category — Distribuição por categoria
// ---------------------------------------------------------------------------
router.get("/transparency/demands-by-category", async (_req: Request, res: Response) => {
  const rows = await db
    .select({
      category: demands.category,
      count: count(),
    })
    .from(demands)
    .groupBy(demands.category)
    .orderBy(sql`count(*) DESC`);

  res.json(rows.map((r) => ({ category: r.category, count: Number(r.count) })));
});

// ---------------------------------------------------------------------------
// GET /transparency/demands-by-status — Distribuição por status
// ---------------------------------------------------------------------------
router.get("/transparency/demands-by-status", async (_req: Request, res: Response) => {
  const rows = await db
    .select({
      status: demands.status,
      count: count(),
    })
    .from(demands)
    .groupBy(demands.status);

  res.json(
    rows.map((r) => ({
      status: r.status,
      count: Number(r.count),
      label: STATUS_LABELS[r.status] ?? r.status,
    })),
  );
});

// ---------------------------------------------------------------------------
// GET /transparency/monthly-trend — Série temporal mensal (12 meses)
// ---------------------------------------------------------------------------
router.get("/transparency/monthly-trend", async (_req: Request, res: Response) => {
  /**
   * Agrupa registros por mês nos últimos 12 meses.
   * DATE_TRUNC é nativo do PostgreSQL e eficiente com o índice em createdAt.
   * O formato "YYYY-MM" é agnóstico de locale e adequado para sorting.
   */
  const rows = await db.execute(sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
      COUNT(*)::integer AS count
    FROM demands
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) ASC
  `);

  // Nomes de meses em português para o frontend
  const PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const data = (rows as { month: string; count: number }[]).map((r) => {
    const monthIndex = parseInt(r.month.split("-")[1], 10) - 1;
    return {
      month: r.month,
      count: Number(r.count),
      label: PT_MONTHS[monthIndex] ?? r.month,
    };
  });

  res.json(data);
});

export default router;
