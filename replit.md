# UNDF Participa (Voz UnDF)

A civic participation platform for the Universidade de Brasília (UnDF) community — students, professors, and staff can register demands, submit proposals, track transparency, and engage with ODS 16 goals.

## Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (artifact: `undf-participa`)
- **Backend**: Express 5 + Drizzle ORM (artifact: `api-server`)
- **Auth & Database**: Supabase (PostgreSQL, Supabase Auth with JWT)
- **Monorepo**: pnpm workspaces

## Running the project

Both services start automatically via configured workflows:

| Workflow | Command | Port |
|---|---|---|
| `artifacts/undf-participa: web` | `pnpm --filter @workspace/undf-participa run dev` | 21016 |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 |

To install dependencies: `pnpm install` from the workspace root.

## Environment variables

All required env vars are already configured in the Replit environment:

- `DATABASE_URL` / `DIRECT_URL` — Supabase PostgreSQL connection strings
- `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` — Supabase project credentials
- `SUPABASE_JWKS_URL` — JWT verification endpoint
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — Frontend-exposed Supabase config

## Key libraries

- `lib/db` — Drizzle ORM schema and database client
- `lib/api-zod` — Shared Zod schemas for API validation
- `lib/api-spec` — OpenAPI spec + Orval codegen config
- `lib/api-client-react` — Generated React Query hooks
- `lib/auth-web` — Supabase auth context/hooks for the frontend

## User preferences

<!-- Add preferences here as requested -->
