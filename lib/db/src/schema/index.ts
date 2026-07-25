/**
 * @module schema
 * @description Schema centralizado do banco de dados da plataforma Voz UnDF.
 *
 * Arquitetura de dados:
 * - `users`: perfis vinculados ao Supabase Auth (authUserId = sub do JWT).
 * - `demands`: entidade central — registros de demandas, sugestões e propostas.
 * - `demand_supports`: relação M:N entre usuários e demandas ("Também sou afetado").
 * - `proposals`: propostas formais com ciclo de vida independente.
 * - `proposal_supports`: apoios a propostas.
 * - `demand_status_history`: trilha de auditoria de mudanças de status.
 *
 * Segurança:
 * - IDs de autenticação são UUIDs gerenciados pelo Supabase Auth.
 * - `isAnonymous` controla exposição de dados do autor em queries públicas.
 * - Roles são definidas no backend e carregadas do banco, nunca enviadas pelo frontend.
 */

import {
  pgTable,
  text,
  serial,
  boolean,
  timestamp,
  varchar,
  integer,
  index,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Roles da plataforma — nomenclatura em português
// ---------------------------------------------------------------------------

export const USER_ROLES = [
  "estudante",
  "docente",
  "servidor",
  "gestor",
  "administrador",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

// ---------------------------------------------------------------------------
// Users — perfis vinculados ao Supabase Auth
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  /** ID do perfil local (UUID). Pode ser diferente do authUserId. */
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`)
    .$defaultFn(() => crypto.randomUUID()),
  /** ID do usuário no Supabase Auth (claim sub do JWT). */
  authUserId: varchar("auth_user_id").unique().notNull(),
  email: varchar("email").unique(),
  fullName: varchar("full_name"),
  avatarUrl: varchar("avatar_url"),
  /** Papel do usuário na plataforma. carregado do banco, nunca confiado do frontend. */
  role: text("role", { enum: USER_ROLES })
    .default("estudante")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ---------------------------------------------------------------------------
// Demands — Núcleo do sistema de gestão participativa
// ---------------------------------------------------------------------------

export const DEMAND_CATEGORIES = [
  "Infraestrutura",
  "Ensino e Pesquisa",
  "Assistência Estudantil",
  "Administração",
  "Tecnologia",
  "Acessibilidade",
  "Cultura e Esporte",
  "Sugestão de Melhoria",
] as const;

export const DEMAND_STATUSES = ["received", "processing", "completed", "archived"] as const;
export const DEMAND_TYPES = ["text", "audio", "image", "video"] as const;

export const demands = pgTable(
  "demands",
  {
    id: serial("id").primaryKey(),
    protocol: varchar("protocol", { length: 20 }).notNull().unique(),
    type: text("type", { enum: DEMAND_TYPES }).notNull(),
    category: text("category", { enum: DEMAND_CATEGORIES })
      .default("Sugestão de Melhoria")
      .notNull(),
    content: text("content"),
    mediaUrl: text("media_url"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    address: text("address"),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    userId: varchar("user_id").references(() => users.id),
    targetUnit: text("target_unit"),
    status: text("status", { enum: DEMAND_STATUSES }).default("received").notNull(),
    adminResponse: text("admin_response"),
    supportCount: integer("support_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_demands_protocol").on(t.protocol),
    index("idx_demands_status").on(t.status),
    index("idx_demands_category").on(t.category),
    index("idx_demands_created_at").on(t.createdAt),
    index("idx_demands_user_id").on(t.userId),
  ],
);

export const insertDemandSchema = createInsertSchema(demands).omit({
  id: true,
  protocol: true,
  supportCount: true,
  adminResponse: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type Demand = typeof demands.$inferSelect;
export type InsertDemand = z.infer<typeof insertDemandSchema>;

// ---------------------------------------------------------------------------
// Demand Supports — "Também sou afetado"
// ---------------------------------------------------------------------------

export const demandSupports = pgTable(
  "demand_supports",
  {
    demandId: integer("demand_id")
      .notNull()
      .references(() => demands.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.demandId, t.userId] }),
    index("idx_demand_supports_demand").on(t.demandId),
    index("idx_demand_supports_user").on(t.userId),
  ],
);

export type DemandSupport = typeof demandSupports.$inferSelect;

// ---------------------------------------------------------------------------
// Demand Status History — trilha de auditoria
// ---------------------------------------------------------------------------

export const demandStatusHistory = pgTable(
  "demand_status_history",
  {
    id: serial("id").primaryKey(),
    demandId: integer("demand_id")
      .notNull()
      .references(() => demands.id, { onDelete: "cascade" }),
    previousStatus: text("previous_status", { enum: DEMAND_STATUSES }),
    newStatus: text("new_status", { enum: DEMAND_STATUSES }).notNull(),
    adminResponse: text("admin_response"),
    changedBy: varchar("changed_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_demand_status_history_demand").on(t.demandId),
    index("idx_demand_status_history_created").on(t.createdAt),
  ],
);

export type DemandStatusHistory = typeof demandStatusHistory.$inferSelect;

// ---------------------------------------------------------------------------
// Proposals — Propostas formais da comunidade
// ---------------------------------------------------------------------------

export const PROPOSAL_STATUSES = [
  "open",
  "under_review",
  "approved",
  "rejected",
  "implemented",
] as const;

export const PROPOSAL_CATEGORIES = DEMAND_CATEGORIES;

export const proposals = pgTable(
  "proposals",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    category: text("category", { enum: PROPOSAL_CATEGORIES }).notNull(),
    status: text("status", { enum: PROPOSAL_STATUSES }).default("open").notNull(),
    userId: varchar("user_id").references(() => users.id),
    targetUnit: text("target_unit"),
    adminDecision: text("admin_decision"),
    supportCount: integer("support_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_proposals_status").on(t.status),
    index("idx_proposals_category").on(t.category),
    index("idx_proposals_created_at").on(t.createdAt),
  ],
);

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  supportCount: true,
  adminDecision: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

// ---------------------------------------------------------------------------
// Proposal Supports — Apoios a propostas
// ---------------------------------------------------------------------------

export const proposalSupports = pgTable(
  "proposal_supports",
  {
    proposalId: integer("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.proposalId, t.userId] }),
    index("idx_proposal_supports_proposal").on(t.proposalId),
  ],
);

export type ProposalSupport = typeof proposalSupports.$inferSelect;

// ---------------------------------------------------------------------------
// Aliases para compatibilidade
// ---------------------------------------------------------------------------

export const usersTable = users;
