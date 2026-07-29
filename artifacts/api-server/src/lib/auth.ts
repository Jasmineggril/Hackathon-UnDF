import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { AuthUser } from '@workspace/api-zod';
import { db, users } from '@workspace/db';
import { eq } from 'drizzle-orm';
import memoizee from 'memoizee';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const jwksUrl = process.env.SUPABASE_JWKS_URL;

if (!supabaseUrl) throw new Error('SUPABASE_URL is required');
if (!supabaseAnonKey) throw new Error('SUPABASE_PUBLISHABLE_KEY is required');

const ISSUER = `${supabaseUrl}/auth/v1`;

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

if (jwksUrl) {
  jwks = createRemoteJWKSet(new URL(jwksUrl));
}

const getProfile = memoizee(
  async (authUserId: string) => {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, authUserId));
    return row ?? null;
  },
  { max: 500, maxAge: 60_000, promise: true },
);

export interface VerifiedToken {
  sub: string;
  email?: string;
  payload: JWTPayload;
}

/**
 * Validate a Supabase access token.
 *
 * Strategy:
 * 1. If JWKS endpoint is configured, try asymmetric JWT verification.
 * 2. Fall back to Supabase userinfo endpoint (for HS256 tokens).
 */
export async function verifyToken(token: string): Promise<VerifiedToken> {
  if (jwks) {
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: ISSUER,
      });
      return {
        sub: payload.sub!,
        email: payload.email as string | undefined,
        payload,
      };
    } catch {
      // JWKS failed — log for debugging and fall through to userinfo
      try {
        console.warn('[auth] JWKS verification failed for token');
      } catch {}
    }
  }

  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey!,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resp.ok) {
    let body = '';
    try {
      body = await resp.text();
    } catch {}
    throw new Error(`Invalid token (userinfo ${resp.status}): ${body}`);
  }

  const data = await resp.json() as { id: string; email?: string };
  return {
    sub: data.id,
    email: data.email,
    payload: {},
  };
}

/**
 * Load or create a local profile for a Supabase auth user.
 * Returns the full profile with role.
 */
export async function loadProfile(authUserId: string, email?: string) {
  let profile = await getProfile(authUserId);

  if (!profile) {
    const [created] = await db
      .insert(users)
      .values({
        authUserId,
        email: email ?? null,
        role: 'estudante',
      })
      .returning();
    profile = created;
    getProfile.clear?.();
  }

  return profile;
}

export function toAuthUser(profile: {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
}): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    role: profile.role as AuthUser['role'],
  };
}
