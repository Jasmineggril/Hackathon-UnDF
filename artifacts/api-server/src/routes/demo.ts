/**
 * @module routes/demo
 * @description Endpoint de acesso de demonstração — habilitado apenas quando DEMO_MODE=true.
 *
 * Segurança:
 * - Rota completamente desativada em produção (sem DEMO_MODE=true).
 * - Credenciais da conta demo NUNCA expostas ao frontend.
 * - Conta demo deve ter role 'estudante', sem permissões administrativas.
 * - Não é um bypass de JWT — faz autenticação real via Supabase Auth REST API.
 */

import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const isDemoEnabled = process.env.DEMO_MODE === "true";
const hasAdminDemo = Boolean(process.env.DEMO_ADMIN_EMAIL && process.env.DEMO_ADMIN_PASSWORD);

router.post("/demo/login", async (req: Request, res: Response) => {
  if (!isDemoEnabled) {
    res.status(404).json({ message: "Modo de demonstração não está habilitado." });
    return;
  }

  const requestedType = String(req.body?.type ?? "student").toLowerCase();
  const loginType = requestedType === "admin" ? "admin" : "student";

  const email = loginType === "admin" ? process.env.DEMO_ADMIN_EMAIL : process.env.DEMO_USER_EMAIL;
  const password = loginType === "admin" ? process.env.DEMO_ADMIN_PASSWORD : process.env.DEMO_USER_PASSWORD;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!email || !password) {
    res.status(503).json({
      message: loginType === "admin"
        ? "Conta administrativa de demonstração não configurada neste ambiente."
        : "Conta de demonstração não configurada neste ambiente.",
    });
    return;
  }

  if (!supabaseUrl || !supabaseKey) {
    res.status(503).json({
      message: "Serviço de autenticação não configurado.",
    });
    return;
  }

  try {
    // Autenticação real via Supabase Auth REST API — não é bypass
    const authResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
        },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!authResponse.ok) {
      const err = await authResponse.json().catch(() => ({})) as Record<string, unknown>;
      res.status(401).json({
        message: (err.error_description as string) || "Falha na autenticação da conta demo.",
      });
      return;
    }

    const session = await authResponse.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    };

    // Retorna apenas os tokens — sem expor credenciais
    res.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
    });
  } catch (err) {
    res.status(503).json({ message: "Serviço temporariamente indisponível." });
  }
});

// Endpoint público para verificar se demo está habilitado (sem expor credenciais)
router.get("/demo/status", (_req: Request, res: Response) => {
  res.json({ enabled: isDemoEnabled, adminEnabled: isDemoEnabled && hasAdminDemo });
});

export default router;
