import { useCallback, useContext } from 'react';
import { AuthContext, type AuthUser } from './auth-provider';

export type { AuthUser };

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

function getBasePath() {
  return import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const login = useCallback(() => {
    window.location.href = `${getBasePath()}login`;
  }, []);

  const logout = useCallback(async () => {
    await ctx.signOut();
    window.location.href = getBasePath();
  }, [ctx.signOut]);

  return {
    user: ctx.user,
    isLoading: ctx.isLoading,
    isAuthenticated: ctx.isAuthenticated,
    login,
    logout,
    signIn: ctx.signIn,
    signUp: ctx.signUp,
    signOut: ctx.signOut,
    getAccessToken: ctx.getAccessToken,
  };
}
