/**
 * @module routes/demands
 * @description Rotas de Demandas da plataforma Voz UnDF.
 *
 * Arquitetura de autorização:
 * - Leitura (GET): pública — qualquer visitante pode listar e consultar demandas.
 * - Escrita (POST): requer sessão autenticada via authMiddleware.
 * - Apoio (POST /:id/support): requer sessão autenticada; operação idempotente.
 * - Admin (GET /admin, PATCH /admin/:id/status): requer role=admin.
 *
 * Privacidade por padrão:
 * - Em listagens públicas, o userId do autor nunca é exposto.
 * - Em demandas anônimas (isAnonymous=true), address e geolocalização
 *   também são removidos das respostas públicas.
 *
 * Performance:
 * - supportCount é mantido desnormalizado na tabela demands para evitar
 *   COUNT(*) em queries de listagem (potencialmente custoso em escala).
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
import { eq, desc, and, sql, count, asc } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Gera protocolo único no formato YYYYMMDD-XXXX.
 * O componente aleatório (4 dígitos) dá 9000 possibilidades por dia,
 * suficiente para o volume esperado da UnDF. Para escala maior,
 * substituir por UUID curto ou sequência atômica no banco.
 */
function generateProtocol(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${dateStr}-${suffix}`;
}

/**
 * Remove campos sensíveis de demandas anônimas antes de expor publicamente.
 * Regra de privacidade: autoria e localização não devem ser vinculadas
 * ao conteúdo quando o autor optou por anonimato.
 */
function sanitizeForPublic(demand: typeof demands.$inferSelect & { userSupported?: boolean }) {
  const { userId, latitude, longitude, ...base } = demand;
  if (demand.isAnonymous) {
    return { ...base, address: null, userSupported: demand.userSupported ?? false };
  }
  return { ...base, userSupported: demand.userSupported ?? false };
}

// ---------------------------------------------------------------------------
// GET /demands — Listagem pública com filtros e paginação
// ---------------------------------------------------------------------------
router.get("/demands", async (req: Request, res: Response) => {
  const parsed = ListDemandsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros inválidos", errors: parsed.error.flatten() });
    return;
  }

  const { category, status, page = 1, limit = 20, sort = "createdAt" } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [
    // Não exibir demandas arquivadas em listagens públicas por padrão
    ...(status ? [eq(demands.status, status)] : [sql`${demands.status} != 'archived'`]),
    ...(category ? [eq(demands.category, category as typeof DEMAND_CATEGORIES[number])] : []),
  ];

  const orderBy = sort === "supportCount"
    ? desc(demands.supportCount)
    : desc(demands.createdAt);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(demands)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(demands)
      .where(and(...conditions)),
  ]);

  res.json({
    data: rows.map(sanitizeForPublic),
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// ---------------------------------------------------------------------------
// POST /demands — Criar nova demanda (requer autenticação)
// ---------------------------------------------------------------------------
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

  // Validação de negócio: demandas de texto precisam ter conteúdo
  if (input.type === "text" && !input.content?.trim()) {
    res.status(400).json({ message: "Descreva sua demanda.", field: "content" });
    return;
  }

  // Protocolo gerado no servidor — nunca aceitar do cliente
  let protocol = generateProtocol();

  // Garantia de unicidade (colisão é rara mas possível)
  const [existing] = await db
    .select({ id: demands.id })
    .from(demands)
    .where(eq(demands.protocol, protocol));
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

// ---------------------------------------------------------------------------
// GET /demands/protocol/:protocol — Consulta por protocolo (público)
// ---------------------------------------------------------------------------
router.get("/demands/protocol/:protocol", async (req: Request, res: Response) => {
  const { protocol } = req.params;

  const [demand] = await db
    .select()
    .from(demands)
    .where(eq(demands.protocol, protocol));

  if (!demand) {
    res.status(404).json({ message: "Protocolo não encontrado." });
    return;
  }

  // Verifica se o usuário logado já apoiou (informação extra para UI)
  let userSupported = false;
  if (req.isAuthenticated()) {
    const [support] = await db
      .select()
      .from(demandSupports)
      .where(
        and(
          eq(demandSupports.demandId, demand.id),
          eq(demandSupports.userId, req.user.id),
        ),
      );
    userSupported = !!support;
  }

  res.json(sanitizeForPublic({ ...demand, userSupported }));
});

// ---------------------------------------------------------------------------
// POST /demands/:id/support — Toggle "Também sou afetado" (requer autenticação)
// ---------------------------------------------------------------------------
router.post("/demands/:id/support", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Autenticação necessária para apoiar uma demanda." });
    return;
  }

  const id = parseInt(req.params.id, 10);
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
    .where(
      and(
        eq(demandSupports.demandId, id),
        eq(demandSupports.userId, req.user.id),
      ),
    );

  let supported: boolean;
  let newCount: number;

  if (existingSupport) {
    // Idempotência: remover apoio existente
    await db
      .delete(demandSupports)
      .where(
        and(
          eq(demandSupports.demandId, id),
          eq(demandSupports.userId, req.user.id),
        ),
      );
    // Decrementa contagem desnormalizada com proteção contra negativo
    const [updated] = await db
      .update(demands)
      .set({ supportCount: sql`GREATEST(${demands.supportCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(demands.id, id))
      .returning({ supportCount: demands.supportCount });
    supported = false;
    newCount = updated.supportCount;
  } else {
    // Adicionar novo apoio
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

// ---------------------------------------------------------------------------
// GET /admin/demands — Listagem administrativa (role=admin)
// ---------------------------------------------------------------------------
router.get("/admin/demands", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Não autenticado." });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Acesso restrito ao painel administrativo." });
    return;
  }

  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "50"), 10);
  const status = req.query.status as string | undefined;
  const offset = (page - 1) * limit;

  const conditions = status ? [eq(demands.status, status as typeof DEMAND_STATUSES[number])] : [];

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

  res.json({
    data: rows,  // Admin vê todos os dados, incluindo userId
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

// ---------------------------------------------------------------------------
// PATCH /admin/demands/:id/status — Atualizar status (role=admin)
// ---------------------------------------------------------------------------
router.patch("/admin/demands/:id/status", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Não autenticado." });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Acesso restrito ao painel administrativo." });
    return;
  }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  const parsed = UpdateDemandStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Dados inválidos" });
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

  req.log.info({ id, status: parsed.data.status }, "demand.status_updated");
  res.json(updated);
});

export default router;
