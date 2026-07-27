/**
 * @module routes/media
 * @description Rotas de mídia privada — geração de URLs assinadas via Supabase Storage.
 *
 * Uso: envie POST /api/media/signed-url com { bucket, path, expiresIn? }
 * para obter uma URL temporária de acesso ao objeto privado.
 *
 * Bucket padrão esperado: "media" (privado, criado no Supabase Storage).
 * Configurar RLS no Supabase para restringir uploads/downloads conforme necessário.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";

const router: IRouter = Router();

const SignedUrlBody = z.object({
  bucket: z.string().min(1).max(63),
  path: z.string().min(1).max(1024),
  expiresIn: z.number().int().min(60).max(86400).default(3600),
});

/**
 * POST /media/signed-url — Gera URL assinada para objeto privado no Supabase Storage.
 * Requer autenticação. Usa a service-role key para contornar RLS.
 */
router.post("/media/signed-url", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Autenticação necessária." });
    return;
  }

  const parsed = SignedUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Dados inválidos",
      errors: parsed.error.flatten(),
    });
    return;
  }

  const { bucket, path, expiresIn } = parsed.data;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    res.status(503).json({ message: "Serviço de armazenamento não configurado." });
    return;
  }

  try {
    const storageRes = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/${bucket}/${path}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({ expiresIn }),
      },
    );

    if (!storageRes.ok) {
      const detail = await storageRes.json().catch(() => ({}));
      req.log.warn({ bucket, path, status: storageRes.status }, "media.signed_url_failed");
      res.status(storageRes.status).json({
        message: "Erro ao gerar URL assinada.",
        detail,
      });
      return;
    }

    const data = (await storageRes.json()) as { signedURL: string };
    const signedUrl = `${supabaseUrl}${data.signedURL}`;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    req.log.info({ bucket, path }, "media.signed_url_issued");
    res.json({ signedUrl, expiresAt });
  } catch {
    res.status(500).json({ message: "Erro interno ao gerar URL assinada." });
  }
});

export default router;
