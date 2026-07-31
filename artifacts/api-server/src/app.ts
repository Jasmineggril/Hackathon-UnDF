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

import cors, { type CorsOptions } from "cors";
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

const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Requisições same-origin não enviam Origin
    if (!origin) return callback(null, true);

    // Desenvolvimento: aceita localhost e domínio Replit
    if (isDev) {
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      const replitDomain = process.env.REPLIT_DEV_DOMAIN;
      if (replitDomain && origin.endsWith(replitDomain)) {
        return callback(null, true);
      }
      // Em dev, aceita qualquer origem para facilitar testes
      return callback(null, true);
    }

    // Produção: apenas domínios explicitamente autorizados
    const allowed: string[] = [];

    // Domínio de produção configurado manualmente (ex: https://voz.undf.edu.br)
    if (process.env.PRODUCTION_DOMAIN) {
      allowed.push(process.env.PRODUCTION_DOMAIN);
    }

    // VERCEL_URL é definido automaticamente pela Vercel em cada deploy
    if (process.env.VERCEL_URL) {
      allowed.push(`https://${process.env.VERCEL_URL}`);
    }

    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origem não autorizada: ${origin}`));
  },
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

app.use(cors(corsOptions));
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
