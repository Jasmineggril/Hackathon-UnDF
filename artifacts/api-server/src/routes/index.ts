/**
 * @module routes/index
 * @description Roteador central da API do Voz UnDF.
 */

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import demandsRouter from "./demands";
import proposalsRouter from "./proposals";
import transparencyRouter from "./transparency";
import mediaRouter from "./media";
import demoRouter from "./demo";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(demandsRouter);
router.use(proposalsRouter);
router.use(transparencyRouter);
router.use(mediaRouter);
router.use(demoRouter);
router.use(userRouter);

export default router;
