#!/usr/bin/env tsx
/**
 * Script de teste de conexão com o banco de dados.
 * Uso: pnpm --filter @workspace/db test:connection
 *
 * Verifica:
 * 1. Variáveis de ambiente obrigatórias
 * 2. Conexão TCP com o host
 * 3. Query simples (SELECT 1)
 * 4. Listagem de tabelas existentes
 */
import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(__dirname, "../../.env") });

const REQUIRED_VARS = ["DATABASE_URL"] as const;
const RECOMMENDED_VARS = ["DIRECT_URL"] as const;

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = "****";
    if (u.username) u.username = u.username.slice(0, 4) + "****";
    return u.toString();
  } catch {
    return "(invalid URL)";
  }
}

async function main() {
  console.log("=== Voz UnDF — Teste de Conexão PostgreSQL ===\n");

  // 1. Variáveis de ambiente
  console.log("[1/4] Verificando variáveis de ambiente...");
  const missing = REQUIRED_VARS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`  ERRO: Variáveis ausentes: ${missing.join(", ")}`);
    process.exit(1);
  }

  for (const v of REQUIRED_VARS) {
    const val = process.env[v]!;
    console.log(`  ${v} = ${maskUrl(val)}`);
  }

  for (const v of RECOMMENDED_VARS) {
    const val = process.env[v];
    console.log(`  ${v} = ${val ? maskUrl(val) : "(não definida — usando DATABASE_URL)"}`);
  }

  // 2. Conexão
  console.log("\n[2/4] Conectando ao PostgreSQL...");
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10_000,
  });

  try {
    await client.connect();
    console.log("  Conexão estabelecida com sucesso!");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ERRO ao conectar: ${msg}`);
    process.exit(1);
  }

  // 3. Query simples
  console.log("\n[3/4] Executando SELECT 1...");
  try {
    const result = await client.query("SELECT 1 AS ok");
    console.log(`  Resultado: ${result.rows[0].ok === 1 ? "OK" : "FALHA"}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ERRO: ${msg}`);
    await client.end();
    process.exit(1);
  }

  // 4. Listar tabelas
  console.log("\n[4/4] Listando tabelas existentes...");
  try {
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (result.rows.length === 0) {
      console.log("  Nenhuma tabela encontrada (banco vazio ou schema ausente).");
      console.log("  Execute: pnpm --filter @workspace/db push");
    } else {
      console.log(`  ${result.rows.length} tabela(s) encontrada(s):`);
      for (const row of result.rows) {
        console.log(`    - ${row.table_name}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ERRO ao listar tabelas: ${msg}`);
  }

  await client.end();
  console.log("\n=== Teste concluído ===");
}

main().catch((err) => {
  console.error("Erro inesperado:", err);
  process.exit(1);
});
