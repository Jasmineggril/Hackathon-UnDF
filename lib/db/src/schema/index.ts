/**
 * @module schema
 * @description Schema centralizado do banco de dados da plataforma Voz UnDF.
 *
 * Arquitetura de dados:
 * - `users` / `sessions`: gerenciados pelo Replit Auth (OIDC). Não remover.
 * - `demands`: entidade central — registros de demandas, sugestões e propostas da comunidade acadêmica.
 * - `demand_supports`: relação M:N entre usuários e demandas (funcionalidade "Também sou afetado").
 * - `proposals`: propostas formais submetidas pela comunidade, com ciclo de vida independente.
 * - `proposal_supports`: apoios a propostas (similar a demand_supports).
 *
 * Decisão arquitetural: separar demandas (problemas relatados) de propostas (soluções sugeridas)
 * para manter responsabilidades claras e permitir fluxos de gestão distintos no painel administrativo.
 *
 * Segurança:
 * - Todos os IDs de usuário são UUIDs (resistentes a enumeração).
 * - O campo `isAnonymous` determina o nível de exposição dos dados do autor em queries públicas.
 * - Dados de geolocalização são opcionais e nunca expostos anonimamente.
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
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Auth tables — obrigatórias para o Replit Auth. Não remover nem renomear.
// ---------------------------------------------------------------------------

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (t) => [index("IDX_session_expire").on(t.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  /** Papel do usuário na plataforma. 'admin' tem acesso ao painel de gestão. */
  role: text("role", { enum: ["student", "faculty", "staff", "admin"] })
    .default("student")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ---------------------------------------------------------------------------
// Demands — Núcleo do sistema de gestão participativa
// ---------------------------------------------------------------------------

/**
 * Categorias alinhadas ao contexto universitário da UnDF.
 * As categorias abaixo refletem a estrutura organizacional acadêmica e as necessidades da comunidade universitária.
 */
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
    /** Protocolo único gerado no servidor: YYYYMMDD-XXXX. Imutável após criação. */
    protocol: varchar("protocol", { length: 20 }).notNull().unique(),
    type: text("type", { enum: DEMAND_TYPES }).notNull(),
    category: text("category", { enum: DEMAND_CATEGORIES })
      .default("Sugestão de Melhoria")
      .notNull(),
    content: text("content"),
    /** URL do arquivo de mídia (áudio, imagem, vídeo). Armazenado externamente. */
    mediaUrl: text("media_url"),
    /**
     * Geolocalização opcional — apenas capturada com consentimento explícito do usuário.
     * Não exposta publicamente quando isAnonymous = true (regra de privacidade por padrão).
     */
    latitude: text("latitude"),
    longitude: text("longitude"),
    address: text("address"),
    /**
     * Quando true, o userId não é exposto em endpoints públicos.
     * A anonimidade é preservada mesmo no painel administrativo
     * (apenas o protocolo e o conteúdo ficam visíveis para gestores).
     */
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    /** Referência ao autor. NULL permitido para demandas anônimas sem autenticação. */
    userId: varchar("user_id").references(() => users.id),
    /** Setor ou unidade acadêmica alvo da demanda. Ex: "Coordenação de Engenharia" */
    targetUnit: text("target_unit"),
    status: text("status", { enum: DEMAND_STATUSES }).default("received").notNull(),
    /** Resposta oficial da equipe gestora. Visível ao autor via consulta de protocolo. */
    adminResponse: text("admin_response"),
    /** Contagem desnormalizada de apoios para performance em queries de listagem. */
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

/**
 * Funcionalidade de apoio a demandas existentes.
 * Permite que múltiplos membros da comunidade sinalizem que compartilham
 * o mesmo problema, aumentando a priorização pela gestão.
 *
 * Restrição de unicidade composta (demandId + userId) garante idempotência.
 */
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
    /** Resposta/decisão oficial da gestão após revisão. */
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
// Aliases for Replit Auth template compatibility
// The templates import `sessionsTable` and `usersTable` from @workspace/db.
// Defined here to avoid a separate file — single source of truth.
// ---------------------------------------------------------------------------
export const sessionsTable = sessions;
export const usersTable = users;

