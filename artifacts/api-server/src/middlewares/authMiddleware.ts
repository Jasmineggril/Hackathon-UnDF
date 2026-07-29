import type { AuthUser } from '@workspace/api-zod';
import { type NextFunction, type Request, type Response } from 'express';
import { verifyToken, loadProfile, toAuthUser } from '../lib/auth';
import { db, users } from '@workspace/db';
import { eq } from 'drizzle-orm';

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;

      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

/**
 * Middleware de autenticação JWT via Supabase.
 *
 * 1. Lê o header Authorization: Bearer <token>
 * 2. Valida o JWT (JWKS ou userinfo)
 * 3. Extrai sub e email
 * 4. Carrega/cria perfil local
 * 5. Preenche req.user
 * 6. Não expor detalhes internos em erros
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request['isAuthenticated'];

  const authHeader = req.headers.authorization;
  // Dev-only demo bypass: when DEMO_MODE=true and client sends `x-demo: 1`,
  // load the demo local profile and treat request as authenticated.
  // This is strictly a development convenience and only active when DEMO_MODE=true.
  try {
    // Dev-only demo bypass: enabled only when DEMO_MODE=true AND a
    // DEMO_BYPASS_TOKEN is configured. The client must send the token in the
    // `x-demo-token` header. This reduces accidental activation and is safer
    // than a simple `x-demo: 1` header.
    const demoMode = process.env.DEMO_MODE === 'true';
    const bypassToken = process.env.DEMO_BYPASS_TOKEN;
    const incomingToken = String(req.headers['x-demo-token'] || '').trim();
    if (demoMode && bypassToken && incomingToken && incomingToken === bypassToken) {
      const demoEmail = process.env.DEMO_USER_EMAIL;
      if (demoEmail) {
        const [row] = await db.select().from(users).where(eq(users.email, demoEmail));
        if (row) {
          req.user = toAuthUser(row as any);
          next();
          return;
        }
      }
    }
  } catch (e) {
    // ignore errors and continue to normal flow
  }
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  if (!token) {
    next();
    return;
  }

  try {
    const verified = await verifyToken(token);
    const profile = await loadProfile(verified.sub, verified.email);
    req.user = toAuthUser(profile);
  } catch (err) {
    // Token inválido — segue sem usuário. Logamos para ajudar debugging em dev.
    // Não expor o token nem dados sensíveis.
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[auth] token verification failed:', errorMsg);
  }

  next();
}

/**
 * Middleware de autorização por role.
 * Deve ser usado APÓS authMiddleware.
 *
 * Uso: router.get('/admin', requireRole(['gestor', 'administrador']), handler)
 */
export function requireRole(allowedRoles: readonly string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ message: 'Autenticação necessária.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Acesso restrito.' });
      return;
    }

    next();
  };
}
