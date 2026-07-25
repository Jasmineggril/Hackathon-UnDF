# Voz UnDF

Plataforma Inteligente de Participação e Gestão Colaborativa da Universidade do Distrito Federal. Permite que estudantes, docentes, servidores e gestores registrem demandas, sugestões e propostas, acompanhem o andamento das solicitações e visualizem dados públicos de transparência.

## Run & Operate

- `PORT=8080 pnpm --filter @workspace/api-server run dev` — rodar o servidor API (porta 8080)
- `PORT=3000 BASE_PATH=/ pnpm --filter @workspace/undf-participa run dev` — rodar o frontend (porta 3000)
- `pnpm run typecheck` — verificação completa de tipos em todos os pacotes
- `pnpm run build` — typecheck + build de todos os pacotes
- `pnpm --filter @workspace/api-spec run codegen` — regerar hooks e schemas Zod a partir do spec OpenAPI
- `pnpm --filter @workspace/db run push` — aplicar mudanças no schema do banco (apenas dev)
- Variáveis obrigatórias: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `PORT`, `BASE_PATH`

## Stack

- pnpm workspaces, Node.js, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter (roteamento) + TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Supabase Auth (JWT Bearer)
- Validação: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (a partir do spec OpenAPI)
- Build: esbuild (bundle CJS)
- JWT validation: jose (JWKS ou userinfo fallback)

## Auth Model

- Frontend: `@supabase/supabase-js` client-side, `AuthProvider` + `useAuth` hook
- Login/Cadastro/Logout: feitos pelo Supabase Auth no frontend
- Token: `session.access_token` enviado como `Authorization: Bearer <token>`
- Backend: valida JWT via JWKS (assimétrico) ou userinfo (HS256)
- Backend: carrega perfil local (tabela `users`) com role
- Roles: `estudante`, `docente`, `servidor`, `gestor`, `administrador`
- Role padrão: `estudante` (criado automaticamente no primeiro login)
- Não confiar em role enviado pelo frontend — sempre carregar do banco

## Where things live

- `lib/auth-web/src/` — AuthProvider, useAuth, Supabase client (frontend)
- `artifacts/undf-participa/src/pages/login.tsx` — página de login/cadastro
- `artifacts/api-server/src/lib/auth.ts` — JWT validation + profile loading (backend)
- `artifacts/api-server/src/middlewares/authMiddleware.ts` — auth + role middleware
- `lib/db/src/schema/index.ts` — schema central do banco de dados
- `lib/db/src/env.ts` — validação centralizada de variáveis de ambiente

## Environment Variables

- `DATABASE_URL` — PostgreSQL (pooler, porta 6543)
- `DIRECT_URL` — PostgreSQL (direto, porta 5432, para migrações)
- `SUPABASE_URL` — URL do projeto Supabase
- `SUPABASE_PUBLISHABLE_KEY` — Anon key (pode ser usada no frontend)
- `SUPABASE_SECRET_KEY` — Service role key (APENAS backend)
- `SUPABASE_JWKS_URL` — JWKS endpoint (opcional, fallback via userinfo)
- `VITE_SUPABASE_URL` — Exposto ao frontend
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Exposto ao frontend
- `SESSION_SECRET` — Secret para sessões (opcional)
- `PORT` — Porta do servidor
- `NODE_ENV` — development/production

## Gotchas

- PORT e BASE_PATH devem ser passados explicitamente ao iniciar os serviços.
- O banco de dados usa Supabase; `DATABASE_URL` deve apontar para o pooler.
- `SUPABASE_SECRET_KEY` nunca deve aparecer no frontend ou em logs.
- Antes de modificar o schema, analisar `lib/db/src/schema/index.ts` e usar `pnpm --filter @workspace/db run push`.
