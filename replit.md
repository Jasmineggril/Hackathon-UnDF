# UNDF Participa

A civic participation web platform for the Defensoria Pública do Distrito Federal (UNDF). Citizens can submit demands, view proposals, track transparency data, and participate in governance — built in Portuguese (Brazilian).

## Stack

- **Frontend**: React 19 + Vite 7, Tailwind CSS v4, Wouter (routing), TanStack Query, Radix UI, Framer Motion
- **Backend**: Express 5 (TypeScript), built with esbuild, running on Node 20
- **Database / Auth**: Supabase (PostgreSQL + Auth)
- **Monorepo**: pnpm workspaces

## Project Structure

```
artifacts/
  undf-participa/   # React/Vite frontend (port 21016 in dev)
  api-server/       # Express API server (port 8080 in dev)
lib/                # Shared packages (db, auth, api-client, etc.)
scripts/            # Post-merge and utility scripts
```

## Running in Development

Both services start automatically via the configured workflows:

- **Frontend**: `pnpm --filter @workspace/undf-participa run dev` → http://localhost:21016
- **API Server**: `pnpm --filter @workspace/api-server run dev` → http://localhost:8080

To install dependencies: `pnpm install`

## Environment Variables

All environment variables are pre-configured in the Replit environment (`.replit` `[userenv.shared]`):

- `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` — Supabase project
- `DIRECT_URL` — direct PostgreSQL connection string
- `SUPABASE_JWKS_URL` — for JWT verification on the API
- `DEMO_MODE` / `VITE_DEMO_MODE` — enables demo banner and mock data
- `SESSION_SECRET` — stored as a Replit secret

## Notes

- `zod` must be bundled (not externalized) in `artifacts/api-server/build.mjs` — it's a workspace dependency resolved via pnpm symlinks that esbuild can't find at runtime when external.
- The API server rebuilds on every `dev` start via esbuild before running the dist output.
- `DEMO_MODE=true` is set by default, showing a demo banner and using mock/seeded data.
