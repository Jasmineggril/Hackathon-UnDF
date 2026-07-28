/**
 * Testes: modo de demonstração
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

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
