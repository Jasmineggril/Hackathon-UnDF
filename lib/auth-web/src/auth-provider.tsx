import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase, type Session } from './supabase-client';

const API_BASE = import.meta.env.BASE_URL?.replace(/\/+$/, '') || '';

export interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; session?: Session | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string; session?: Session | null }>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthState | null>(null);

async function fetchProfile(token: string): Promise<AuthUser | null> {
  try {
    const resp = await fetch(`${API_BASE}/api/auth/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return null;
    const data = await resp.json() as { user: AuthUser | null };
    return data.user ?? null;
  } catch {
    return null;
  }
}

function sessionUserBasic(s: Session): AuthUser {
  const meta = s.user.user_metadata ?? {};
  return {
    id: s.user.id,
    email: s.user.email ?? null,
    fullName: meta.full_name ?? null,
    avatarUrl: meta.avatar_url ?? null,
    role: (meta.role as string) ?? 'estudante',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function initSession() {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      setSession(s);
      if (s) {
        setUser(sessionUserBasic(s));
        const profile = await fetchProfile(s.access_token);
        if (!mountedRef.current) return;
        if (profile) setUser(profile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, s: Session | null) => {
        setSession(s);
        if (s) {
          setUser(sessionUserBasic(s));
          const profile = await fetchProfile(s.access_token);
          if (!mountedRef.current) return;
          if (profile) setUser(profile);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      },
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    return { session: data.session ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      return { error: error.message };
    }
    return { session: data.session ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const { data: { session: s } } = await supabase.auth.getSession();
    return s?.access_token ?? null;
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    getAccessToken,
  }), [user, session, isLoading, signIn, signUp, signOut, getAccessToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
