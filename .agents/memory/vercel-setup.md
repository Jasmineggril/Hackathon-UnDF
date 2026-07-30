---
name: Vercel deployment setup
description: How this project deploys — Vercel (not Replit), project settings, env vars, and what was fixed
---

## Project
- Vercel team: jasmineggrils-projects
- Vercel project: hackathon-un-df-api-server
- GitHub repo: Jasmineggril/Hackathon-UnDF (branch: main)
- repoId: 1307712497

## Build settings (all correct now)
- Framework: null (Other)
- Install: pnpm install --frozen-lockfile
- Build: pnpm run build (root script: typecheck + recursive build)
- Output: artifacts/undf-participa/dist/public
- Root directory: null (repo root)

## Env vars on Vercel
Backend (already set): DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, DEMO_MODE, DEMO_USER_EMAIL, DEMO_USER_PASSWORD, NODE_ENV
Added in this session: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_DEMO_MODE, SUPABASE_JWKS_URL

## What was fixed to make deployments work
- pnpm-lock.yaml was outdated (vercel removed from package.json but still in lockfile) → ran pnpm install, committed, pushed via gitPush
- Vercel project had no build/install/output settings → patched via API
- VITE_ env vars were missing → added via API

## VERCEL_TOKEN
Stored as Replit secret: VERCEL_TOKEN

**Why:** Vercel reads from GitHub on deploy; lockfile must be in sync or --frozen-lockfile fails.
