# Voz UnDF

Plataforma Inteligente de Participação e Gestão Colaborativa da Universidade do Distrito Federal. Permite que estudantes, docentes, servidores e gestores registrem demandas, sugestões e propostas, acompanhem o andamento das solicitações e visualizem dados públicos de transparência.

## Run & Operate

- `PORT=8080 pnpm --filter @workspace/api-server run dev` — rodar o servidor API (porta 8080)
- `PORT=3000 BASE_PATH=/ pnpm --filter @workspace/undf-participa run dev` — rodar o frontend (porta 3000)
- `pnpm run typecheck` — verificação completa de tipos em todos os pacotes
- `pnpm run build` — typecheck + build de todos os pacotes
- `pnpm --filter @workspace/api-spec run codegen` — regerar hooks e schemas Zod a partir do spec OpenAPI
- `pnpm --filter @workspace/db run push` — aplicar mudanças no schema do banco (apenas dev)
- Variáveis obrigatórias: `DATABASE_URL` (gerenciada automaticamente pelo Replit), `PORT`, `BASE_PATH`

## Stack

- pnpm workspaces, Node.js, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter (roteamento) + TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Replit Auth (OIDC)
- Validação: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (a partir do spec OpenAPI)
- Build: esbuild (bundle CJS)

## Where things live

- `artifacts/undf-participa/src/pages/` — páginas da aplicação (Home, Demands, Proposals, Admin, Transparency, ODS16, About)
- `artifacts/undf-participa/src/components/` — componentes reutilizáveis (AudioRecorder, DemandCard, ProposalCard, etc.)
- `artifacts/api-server/src/routes/` — rotas da API (demands, proposals, transparency, auth, health)
- `lib/db/src/schema/index.ts` — schema central do banco de dados (fonte da verdade)
- `lib/api-spec/openapi.yaml` — contrato OpenAPI (gera hooks e schemas automaticamente)

## Architecture decisions

- Demandas e propostas são entidades separadas com ciclos de vida distintos, para permitir fluxos de gestão diferentes no painel administrativo.
- IDs de usuário são UUIDs (resistentes a enumeração).
- `isAnonymous` controla o nível de exposição dos dados do autor em queries públicas.
- Autenticação via Replit Auth (OIDC) — tabelas `users` e `sessions` não devem ser removidas.
- PORT e BASE_PATH são obrigatórios no startup — o vite e o Express vão lançar erro se não estiverem definidos.

## Product

Plataforma de gestão participativa para a comunidade acadêmica da UnDF. Funcionalidades principais:
- Registro de demandas (texto, imagem ou áudio) com geração de protocolo
- Acompanhamento do status da demanda em linha do tempo
- Função "Também sou afetado" (apoio coletivo)
- Área de propostas institucionais com apoios
- Painel público de transparência com indicadores e gráficos
- Painel administrativo protegido para gestores
- Página ODS 16 e página Sobre o projeto

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- PORT e BASE_PATH devem ser passados explicitamente ao iniciar os serviços (não há fallback — o app lança erro).
- O banco de dados é gerenciado pelo Replit; `DATABASE_URL` não deve ser definida manualmente.
- Antes de modificar o schema do banco, analisar o schema atual em `lib/db/src/schema/index.ts` e usar `pnpm --filter @workspace/db run push` para aplicar mudanças.
- Os workflows foram configurados manualmente (os artefatos existiam no filesystem mas não estavam registrados na plataforma Replit).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
