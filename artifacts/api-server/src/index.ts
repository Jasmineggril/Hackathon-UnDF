import "./loadEnv";
import app from "./app";
import { logger } from "./lib/logger";

const REQUIRED = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
] as const;

const RECOMMENDED = [
  "DIRECT_URL",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_JWKS_URL",
] as const;

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  logger.error({ missing }, "Variáveis obrigatórias ausentes — defina-as no .env");
  process.exit(1);
}

const warnMissing = RECOMMENDED.filter((k) => !process.env[k]);
if (warnMissing.length > 0) {
  logger.warn({ missing: warnMissing }, "Variáveis recomendadas ausentes");
}

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

logger.info("Variáveis de ambiente validadas");

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
