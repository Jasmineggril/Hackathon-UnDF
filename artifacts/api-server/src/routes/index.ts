/**
 * @module routes/index
 * @description Roteador central da API do UnDF Participa.
 *
 * Organização das rotas por domínio:
 * - /health — liveness probe para orquestração de containers
 * - /auth/*, /login, /callback, /logout — autenticação OIDC via Replit Auth
 * - /demands/* — gestão de demandas e sugestões da comunidade
 * - /proposals/* — propostas formais com ciclo de vida independente
 * - /transparency/* — dados agregados do portal de transparência (público)
 * - /admin/* — painel administrativo (requer role=admin, verificado nas rotas)
 */

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import demandsRouter from "./demands";
import proposalsRouter from "./proposals";
import transparencyRouter from "./transparency";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(demandsRouter);
router.use(proposalsRouter);
router.use(transparencyRouter);

export default router;
