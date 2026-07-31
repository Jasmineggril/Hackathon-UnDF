/**
 * @module app
 * @description Configuração central do servidor Express para o Voz UnDF.
 *
 * Middleware pipeline:
 * 1. pinoHttp — logging estruturado
 * 2. cors — restrição de origem por ambiente
 * 3. json/urlencoded — parse de body
 * 4. authMiddleware — valida JWT Supabase, carrega req.user
 * 5. router — rotas da API
 */

import cors from "cors";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import pinoHttp from "pino-http";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ---------------------------------------------------------------------------
// CORS — same-origin em produção; permissivo em desenvolvimento
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV !== "production";

function isAllowedOrigin(origin: string, host?: string): boolean {
  // Origem idêntica ao Host da requisição (same-origin — o SPA e a API são
  // servidos pelo mesmo domínio Vercel, inclusive aliases customizados como
  // voz-undf.vercel.app que não correspondem a VERCEL_URL). A comparação é
  // feita pelo hostname para tolerar diferenças de esquema (http/https).
  if (host) {
    const originHost = /^https?:\/\//.test(origin) ? new URL(origin).host : null;
    if (originHost === host) {
      return true;
    }
  }

  // Domínios explicitamente autorizados (separados por vírgula)
  const allowed = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Domínio de produção configurado manualmente (ex: https://voz.undf.edu.br)
  if (process.env.PRODUCTION_DOMAIN) {
    allowed.push(process.env.PRODUCTION_DOMAIN);
  }

  // VERCEL_URL é definido automaticamente pela Vercel em cada deploy
  if (process.env.VERCEL_URL) {
    allowed.push(`https://${process.env.VERCEL_URL}`);
  }

  return allowed.includes(origin);
}

// A lib `cors` não expõe o `req` no callback de `origin`, então montamos um
// middleware que captura `req.headers.host` e delega para o cors com a closure.
const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const host = req.headers.host;
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isDev) return callback(null, true);
      if (isAllowedOrigin(origin, host)) return callback(null, true);
      return callback(new Error(`Origem não autorizada: ${origin}`));
    },
  })(req, res, next);
};

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authMiddleware);

app.use("/api", router);

// ---------------------------------------------------------------------------
// Global error handler — must be LAST middleware (4 params = error handler)
// Garante que todos os erros não tratados retornem JSON, nunca HTML.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode =
    (err as unknown as { status?: number }).status ??
    (err as unknown as { statusCode?: number }).statusCode ??
    500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Erro interno do servidor."
      : (err.message || "Erro interno do servidor.");
  logger.error({ err, statusCode }, "unhandled_route_error");
  if (!res.headersSent) {
    res.status(statusCode).json({ message });
  }
});

export default app;
