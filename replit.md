# UNDF Participa (Voz UnDF)

A civic participation platform for the University of Brasília community, built as a pnpm monorepo.

## Stack

- **Frontend** (`artifacts/undf-participa`): React + Vite, TailwindCSS, shadcn/ui, Supabase Auth, Wouter routing
- **Backend** (`artifacts/api-server`): Express.js, Drizzle ORM, Supabase/PostgreSQL
- **Shared libs** (`lib/`): `api-client-react` (React Query hooks), `api-spec` (OpenAPI + codegen), `db` (Drizzle schema)

## Running the project

Both services start via their configured workflows:

- **Frontend** — `artifacts/undf-participa: web` → `PORT=21016 BASE_PATH=/ pnpm --filter @workspace/undf-participa run dev`
- **API Server** — `artifacts/api-server: API Server` → `PORT=8080 pnpm --filter @workspace/api-server run dev`

## Required environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL pooler URL (port 6543) |
| `DIRECT_URL` | Supabase direct connection URL (port 5432, used by drizzle-kit) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `SUPABASE_SECRET_KEY` | Supabase service role key |
| `SUPABASE_JWKS_URL` | Supabase JWKS endpoint for JWT verification |
| `VITE_SUPABASE_URL` | Supabase URL exposed to the frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key exposed to the frontend |
| `SESSION_SECRET` | Secret for session signing |

## User preferences

- Keep the existing monorepo structure (pnpm workspaces)
- Portuguese-language project; preserve Portuguese in code comments and UI copy
