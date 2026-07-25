import type { AuthUser } from '@workspace/api-zod';
import { type NextFunction, type Request, type Response } from 'express';
import { verifyToken, loadProfile, toAuthUser } from '../lib/auth';

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
  } catch {
    // Token inválido — segue sem usuário
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
