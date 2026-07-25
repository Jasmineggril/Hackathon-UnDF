import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

router.get("/healthz", async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    auth: "configured",
    database: "unknown",
  };

  try {
    const { pool } = await import("@workspace/db");
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      checks.database = "connected";
    } finally {
      client.release();
    }
  } catch {
    checks.database = "disconnected";
    checks.status = "degraded";
  }

  const statusCode = checks.status === "ok" ? 200 : 503;
  res.status(statusCode).json(checks);
});

export default router;
