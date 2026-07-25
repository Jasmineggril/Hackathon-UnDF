import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(__dirname, "../../.env") });

function required(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  DIRECT_URL: optional("DIRECT_URL"),
  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_PUBLISHABLE_KEY: required("SUPABASE_PUBLISHABLE_KEY"),
  SUPABASE_SECRET_KEY: optional("SUPABASE_SECRET_KEY"),
  SUPABASE_JWKS_URL: optional("SUPABASE_JWKS_URL"),
  SESSION_SECRET: optional("SESSION_SECRET"),
  PORT: optional("PORT"),
  NODE_ENV: optional("NODE_ENV") ?? "development",
} as const;
