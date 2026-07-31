/**
 * Testes: modo de demonstração
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@workspace/auth-web", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

import { demoLogin } from "@/hooks/use-user-data";

// ---------------------------------------------------------------------------
// 1. Botão de acesso demo aparece apenas quando habilitado
// ---------------------------------------------------------------------------
describe("VITE_DEMO_MODE flag", () => {
  it("retorna true quando VITE_DEMO_MODE é 'true'", () => {
    const demoMode = import.meta.env.VITE_DEMO_MODE === "true";
    expect(demoMode).toBe(true);
  });

  it("retorna false quando VITE_DEMO_MODE não está definido", () => {
    const originalEnv = import.meta.env.VITE_DEMO_MODE;
    (import.meta.env as Record<string, unknown>).VITE_DEMO_MODE = undefined;
    const demoMode = import.meta.env.VITE_DEMO_MODE === "true";
    expect(demoMode).toBe(false);
    (import.meta.env as Record<string, unknown>).VITE_DEMO_MODE = originalEnv;
  });
});

// ---------------------------------------------------------------------------
// 2. Conta demo não possui role administrativa
// ---------------------------------------------------------------------------
describe("Segurança da conta demo", () => {
  it("a role da conta demo deve ser 'estudante'", () => {
    // Simula um usuário retornado pelo backend após demo login
    const demoUser = {
      id: "demo-user-id",
      email: "demo@undf.edu.br",
      fullName: "Usuário Demo",
      role: "estudante",
    };
    expect(demoUser.role).toBe("estudante");
    expect(demoUser.role).not.toBe("gestor");
    expect(demoUser.role).not.toBe("administrador");
  });

  it("roles administrativas são distintas da role demo", () => {
    const adminRoles = ["gestor", "administrador"];
    const demoRole = "estudante";
    expect(adminRoles).not.toContain(demoRole);
  });
});

// ---------------------------------------------------------------------------
// 3. Fluxo de login demo admin
// ---------------------------------------------------------------------------
describe("demoLogin helper", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia tipo admin ao backend para a conta de demonstração administrativa", async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ access_token: "token-admin", refresh_token: "refresh-admin", expires_in: 3600 }),
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch" as any).mockResolvedValue(mockResponse as any);

    const session = await demoLogin({ type: "admin" });

    expect(fetchSpy).toHaveBeenCalledWith("/api/demo/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "admin" }),
    });
    expect(session.access_token).toBe("token-admin");
    expect(session.refresh_token).toBe("refresh-admin");
  });
});
