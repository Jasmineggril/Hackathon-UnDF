import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./src/env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * DIRECT_URL — conexão direta (sem pooler) usada exclusivamente pelo
 * drizzle-kit em migrações. Evita erros de "prepared statement already exists"
 * quando o Supabase/Supavisor reutiliza conexões.
 *
 * Regra: DIRECT_URL deve apontar para a porta padrão do PostgreSQL (5432)
 * enquanto DATABASE_URL pode usar o pooler (6543).
 */
export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: env.DIRECT_URL ?? env.DATABASE_URL,
  },
});
