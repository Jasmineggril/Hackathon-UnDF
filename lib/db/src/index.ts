import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Prefer DIRECT_URL (Supabase direct connection) over DATABASE_URL
// because Replit's runtime overrides DATABASE_URL with its own PostgreSQL.
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or DIRECT_URL must be set. Did you forget to provision a database?",
  );
}

const isPooler = databaseUrl.includes(":6543");

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("sslmode=") || databaseUrl.includes("supabase")
    ? { rejectUnauthorized: false }
    : undefined,
  max: isPooler ? 5 : 10,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
