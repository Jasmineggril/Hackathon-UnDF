import "dotenv/config";
import { db } from "./index";
import { demands, demandSupports, proposals, proposalSupports, users } from "./schema";
import { eq } from "drizzle-orm";

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD;
const DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL;
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD;
const DEMO_FULL_NAME = "Aluno de Demonstração";
const DEMO_ADMIN_FULL_NAME = "Gestor de Demonstração";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const DEMO_MODE = process.env.DEMO_MODE === "true";

if (!DEMO_MODE) {
  console.error("DEMO_MODE não está habilitado. Execute este seed apenas em ambiente de demonstração.");
  process.exit(1);
}

if (!DEMO_EMAIL || !DEMO_PASSWORD || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Variáveis DEMO_USER_EMAIL, DEMO_USER_PASSWORD, SUPABASE_URL e SUPABASE_SECRET_KEY são necessárias para o seed de demonstração.");
  process.exit(1);
}

if ((DEMO_ADMIN_EMAIL && !DEMO_ADMIN_PASSWORD) || (!DEMO_ADMIN_EMAIL && DEMO_ADMIN_PASSWORD)) {
  console.error("Para criar a conta administrativa de demonstração, defina tanto DEMO_ADMIN_EMAIL quanto DEMO_ADMIN_PASSWORD.");
  process.exit(1);
}

async function getOrCreateSupabaseUser(email: string, password: string, fullName: string) {
  const headers = {
    apikey: SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const search = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    { headers },
  );

  if (!search.ok) {
    throw new Error(`Falha ao consultar usuário Supabase: ${search.statusText}`);
  }

  const data = await search.json().catch(() => ({} as any));
  const usersList = Array.isArray(data) ? (data as any[]) : (data as any).users ?? [];
  const existing = usersList.find((user: any) => user.email === email);
  if (existing) {
    return existing;
  }

  const create = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });

  if (!create.ok) {
    const err = await create.json().catch(() => ({}));
    throw new Error(`Falha ao criar usuário demo: ${create.statusText} ${JSON.stringify(err)}`);
  }

  return await create.json();
}

async function upsertLocalUser(authUserId: string, email: string, fullName: string, role: "estudante" | "administrador" = "estudante") {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUserId));

  if (existing) {
    await db
      .update(users)
      .set({ email, fullName, role })
      .where(eq(users.authUserId, authUserId));
    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({ authUserId, email, fullName, role })
    .returning();

  return created;
}

async function seed() {
  console.log("Preparando dados de demonstração do Voz UnDF...");

  const supabaseUser = await getOrCreateSupabaseUser(DEMO_EMAIL!, DEMO_PASSWORD!, DEMO_FULL_NAME);
  const localUser = await upsertLocalUser(
    supabaseUser.id,
    DEMO_EMAIL!,
    DEMO_FULL_NAME,
    "estudante",
  );

  if (DEMO_ADMIN_EMAIL && DEMO_ADMIN_PASSWORD) {
    const adminSupabaseUser = await getOrCreateSupabaseUser(DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, DEMO_ADMIN_FULL_NAME);
    await upsertLocalUser(
      adminSupabaseUser.id,
      DEMO_ADMIN_EMAIL,
      DEMO_ADMIN_FULL_NAME,
      "administrador",
    );
    console.log("Conta administrativa de demonstração criada ou atualizada.");
  }

  const DEMO_DEMANDS = [
    {
      protocol: "VUNDF-20260726-0001",
      type: "text" as const,
      category: "Acessibilidade" as const,
      content:
        "Melhoria da acessibilidade em uma sala de aula para cadeirantes, com corrimãos e sinalização tátil.",
      isAnonymous: false,
      userId: localUser.id,
      targetUnit: "Divisão de Acessibilidade",
      status: "in_analysis" as const,
      adminResponse: "A demanda foi recebida e está em análise pela equipe de acessibilidade.",
      supportCount: 14,
      createdAt: new Date("2026-07-01T08:30:00Z"),
      updatedAt: new Date("2026-07-10T14:05:00Z"),
    },
    {
      protocol: "VUNDF-20260726-0002",
      type: "text" as const,
      category: "Assistência Estudantil" as const,
      content:
        "Ampliação do horário da biblioteca para atender estudantes com horários de estudo à noite.",
      isAnonymous: false,
      userId: localUser.id,
      targetUnit: "Biblioteca Central",
      status: "completed" as const,
      adminResponse: "A proposta foi encaminhada e está em fase de implementação.",
      supportCount: 28,
      createdAt: new Date("2026-07-02T10:15:00Z"),
      updatedAt: new Date("2026-07-18T16:20:00Z"),
    },
  ];

  const DEMO_PROPOSALS = [
    {
      title: "Criação de espaços colaborativos de estudo",
      description:
        "Propor a criação de espaços de estudo colaborativos no campus, com mesas, tomadas e sinalização adequada.",
      category: "Infraestrutura" as const,
      status: "under_review" as const,
      userId: localUser.id,
      targetUnit: "Pró-Reitoria de Graduação",
      supportCount: 22,
      createdAt: new Date("2026-07-05T11:00:00Z"),
      updatedAt: new Date("2026-07-12T09:40:00Z"),
    },
  ];

  const insertDemand = async (demand: typeof DEMO_DEMANDS[number]) => {
    await db
      .insert(demands)
      .values(demand)
      .onConflictDoNothing({ target: demands.protocol });
  };

  const insertProposal = async (proposal: typeof DEMO_PROPOSALS[number]): Promise<void> => {
    const [existing] = await db.select().from(proposals).where(eq(proposals.title, proposal.title));
    if (existing) return;
    await db.insert(proposals).values(proposal);
  };

  await Promise.all(DEMO_DEMANDS.map(insertDemand));
  await Promise.all(DEMO_PROPOSALS.map(insertProposal));

  const [supportedDemand] = await db
    .select()
    .from(demands)
    .where(eq(demands.protocol, "VUNDF-20260726-0002"));

  if (supportedDemand) {
    await db
      .insert(demandSupports)
      .values({ demandId: supportedDemand.id, userId: localUser.id })
      .onConflictDoNothing();
  }

  const [supportedProposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.title, "Criação de espaços colaborativos de estudo"));

  if (supportedProposal) {
    await db
      .insert(proposalSupports)
      .values({ proposalId: supportedProposal.id, userId: localUser.id })
      .onConflictDoNothing();
  }

  console.log("Dados de demonstração preparados com sucesso.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro durante o seed de demonstração:", err);
  process.exit(1);
});
