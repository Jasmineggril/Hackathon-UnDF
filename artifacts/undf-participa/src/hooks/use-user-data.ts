/**
 * Hooks para dados do usuário autenticado — painel pessoal.
 * Usa fetch direto com token Supabase (o setAuthTokenGetter já está configurado em main.tsx).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@workspace/auth-web";

const BASE = import.meta.env.BASE_URL?.replace(/\/+$/, "") || "";

async function authedFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...headers, ...(opts?.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserStats {
  demandTotal: number;
  demandInProgress: number;
  demandAnswered: number;
  proposalTotal: number;
  supportedTotal: number;
  lastProtocol: { protocol: string; status: string; updatedAt: string } | null;
  lastUpdatedAt: string | null;
}

export interface UserDemand {
  id: number;
  protocol: string;
  type: string;
  category: string;
  content: string | null;
  status: string;
  targetUnit: string | null;
  isAnonymous: boolean;
  supportCount: number;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProposal {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  supportCount: number;
  adminDecision: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSupportedDemand extends UserDemand {
  supportedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    queryFn: () => authedFetch<UserStats>("/api/user/stats"),
    staleTime: 30_000,
  });
}

export function useUserDemands(status?: string) {
  return useQuery<PaginatedResponse<UserDemand>>({
    queryKey: ["/api/user/demands", status],
    queryFn: () =>
      authedFetch<PaginatedResponse<UserDemand>>(
        `/api/user/demands${status && status !== "all" ? `?status=${status}` : ""}`,
      ),
    staleTime: 30_000,
  });
}

export function useUserProposals(status?: string) {
  return useQuery<PaginatedResponse<UserProposal>>({
    queryKey: ["/api/user/proposals", status],
    queryFn: () =>
      authedFetch<PaginatedResponse<UserProposal>>(
        `/api/user/proposals${status && status !== "all" ? `?status=${status}` : ""}`,
      ),
    staleTime: 30_000,
  });
}

export function useUserSupportedDemands() {
  return useQuery<PaginatedResponse<UserSupportedDemand>>({
    queryKey: ["/api/user/supported-demands"],
    queryFn: () =>
      authedFetch<PaginatedResponse<UserSupportedDemand>>("/api/user/supported-demands"),
    staleTime: 30_000,
  });
}

export function useRemoveSupport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (demandId: number) =>
      authedFetch<{ ok: boolean }>(`/api/user/supported-demands/${demandId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/user/supported-demands"] });
      qc.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Types for public demand/proposal responses
// ---------------------------------------------------------------------------

export interface DemandPublic {
  id: number;
  protocol: string;
  type: string;
  category: string;
  content: string | null;
  mediaUrl: string | null;
  status: string;
  isAnonymous: boolean;
  targetUnit: string | null;
  address: string | null;
  supportCount: number;
  adminResponse: string | null;
  userSupported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalPublic {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  supportCount: number;
  adminDecision: string | null;
  targetUnit: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useDemandById(id: number | null) {
  return useQuery<DemandPublic>({
    queryKey: ["/api/demands", id],
    queryFn: () => authedFetch<DemandPublic>(`/api/demands/${id}`),
    enabled: id !== null && !isNaN(id as number),
    staleTime: 30_000,
  });
}

export function useProposalById(id: number | null) {
  return useQuery<ProposalPublic>({
    queryKey: ["/api/proposals", id],
    queryFn: () => authedFetch<ProposalPublic>(`/api/proposals/${id}`),
    enabled: id !== null && !isNaN(id as number),
    staleTime: 30_000,
  });
}

/** Demo login — chama o backend que detém as credenciais */
export async function demoLogin(options?: { type?: "student" | "admin" }): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const BASE_URL = import.meta.env.BASE_URL?.replace(/\/+$/, "") || "";
  const body = JSON.stringify({ type: options?.type ?? "student" });
  const res = await fetch(`${BASE_URL}/api/demo/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) {
    const bodyData = await res.json().catch(() => ({}));
    throw new Error((bodyData as { message?: string }).message ?? "Falha no acesso de demonstração");
  }
  return res.json();
}
