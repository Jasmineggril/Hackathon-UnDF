/**
 * @module app
 * @description Configuração central do servidor Express para o Voz UnDF.
 *
 * Middleware pipeline (ordem importa):
 * 1. pinoHttp — logging estruturado de todas as requisições
 * 2. cors — necessário para cookie-based auth funcionar via proxy do Replit
 * 3. cookieParser — deve vir antes do authMiddleware (lê o cookie de sessão)
 * 4. json/urlencoded — parse de body das requisições
 * 5. authMiddleware — carrega req.user da sessão em cada requisição
 * 6. router — rotas da API
 */

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import pinoHttp from "pino-http";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

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

// credentials: true é obrigatório para o cookie de sessão ser enviado pelo browser
// origin: true aceita qualquer origem (proxy do Replit usa origens variadas)
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carrega o usuário da sessão em cada requisição antes das rotas
app.use(authMiddleware);

app.use("/api", router);

export default app;
