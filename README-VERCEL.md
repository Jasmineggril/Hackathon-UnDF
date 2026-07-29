# Vercel Deployment Guide

## Visão geral
Este monorepo publica:
- frontend React/Vite em `artifacts/undf-participa/dist/public`
- backend Express via Vercel Functions em `api/*`
- API e frontend no mesmo domínio, com SPA routing preservado

## Configuração Vercel
- **Root Directory**: `/` (raiz do monorepo)
- **Install Command**: `pnpm install --frozen-lockfile`
- **Build Command**: `pnpm run typecheck && pnpm --filter @workspace/undf-participa run build && pnpm --filter @workspace/api-server run build`
- **Output Directory**: `artifacts/undf-participa/dist/public`

## Variáveis de ambiente
### Backend (server-side)
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_JWKS_URL`
- `NODE_ENV`
- `PRODUCTION_DOMAIN` (opcional)

### Frontend (client-side)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_DEMO_MODE` (opcional)

### Regras
- `SUPABASE_SECRET_KEY` não deve ser exposto no frontend.
- Nenhuma variável sem `VITE_` deve ser usada diretamente no código do navegador.
- Não versionar `.env`.

## Rotas importantes
- `GET /api/healthz`
- `GET /api/auth/user`
- `POST /api/demo/login`
- `GET /api/user/stats`
- `GET /api/demands`
- `GET /api/proposals`
- `GET /api/transparency/stats`

## Health check
A rota `GET /api/healthz` verifica o status da API e a conexão com o banco.

## Migrações
Para rodar migrações manualmente:

```bash
pnpm --filter @workspace/db run push
```

## Testes locais
```bash
pnpm install
pnpm run typecheck
pnpm --filter @workspace/undf-participa run test
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/undf-participa run build
pnpm --filter @workspace/api-server run build
```

## Comandos locais úteis
- `pnpm dev --filter @workspace/undf-participa`
- `pnpm --filter @workspace/api-server run dev`
- `pnpm --filter @workspace/db run test:connection`

## Observações
- `api/index.ts` e `api/[...path].ts` são entradas Vercel.
- `artifacts/api-server/src/index.ts` continua válido para desenvolvimento local.
- `BASE_PATH` no Vite é padrão `/`.
- `PORT` não é obrigatório para build no frontend.
