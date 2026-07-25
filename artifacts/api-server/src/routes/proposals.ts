/**
 * @module routes/proposals
 * @description Rotas de Propostas Formais da comunidade acadêmica UnDF.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { proposals, proposalSupports } from "@workspace/db";
import { ListProposalsQueryParams, CreateProposalBody } from "@workspace/api-zod";
import { eq, desc, and, sql, count } from "drizzle-orm";

const router: IRouter = Router();

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
    ...(category ? [eq(proposals.category, category as "Infraestrutura" | "Ensino e Pesquisa" | "Assistência Estudantil" | "Administração" | "Tecnologia" | "Acessibilidade" | "Cultura e Esporte" | "Sugestão de Melhoria")] : []),
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

export default router;
