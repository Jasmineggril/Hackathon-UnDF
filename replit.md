# Voz UnDF

Plataforma de participação cidadã da Universidade de Brasília do Distrito Federal (UnDF). Permite que cidadãos registrem demandas, votem em propostas e acompanhem transparência pública.

## Stack

- **Frontend** (`artifacts/undf-participa`): React 19 + Vite + TailwindCSS + Shadcn UI + Wouter + TanStack Query
- **Backend** (`artifacts/api-server`): Express 5 + Drizzle ORM + Supabase (auth + Postgres)
- **Libs compartilhadas**:
  - `lib/db` — schema Drizzle e conexão com banco
  - `lib/api-zod` — tipos e validações Zod gerados do OpenAPI
  - `lib/api-client-react` — hooks React Query gerados do OpenAPI
  - `lib/auth-web` — cliente Supabase para o frontend
  - `lib/api-spec` — spec OpenAPI e config orval (codegen)

## Como rodar

Ambos os serviços rodam automaticamente via workflows do Replit:

| Serviço | Workflow | URL local |
|---------|----------|-----------|
| Frontend | `artifacts/undf-participa: web` | `http://localhost:21016/` |
| API | `artifacts/api-server: API Server` | `http://localhost:8080/api/` |

Para instalar dependências manualmente:
```bash
pnpm install
```

## Variáveis de ambiente necessárias

Configuradas como Replit Secrets:

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | Chave anon/pública do Supabase |
| `SUPABASE_SECRET_KEY` | Chave service_role (apenas backend) |
| `DIRECT_URL` | String de conexão direta Postgres |
| `VITE_SUPABASE_URL` | URL Supabase para o build do frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anon para o build do frontend |

## Health check da API

```
GET /api/healthz
```

Retorna `{"status":"ok","auth":"configured","database":"connected"}` quando tudo está funcionando.

## User preferences

- Projeto em português (pt-BR); manter idioma do código e comentários consistente com o existente.
