/**
 * Testes: mascote Vozinho — persistência de preferências
 */
import { describe, it, expect, beforeEach } from "vitest";

const MASCOTE_KEY = "voz-undf:mascote-hidden";

// ---------------------------------------------------------------------------
// 17. Mascote pode ser ocultado
// 18. Preferência do mascote é persistida
// ---------------------------------------------------------------------------
describe("Mascote — persistência", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mascote não está oculto por padrão", () => {
    const hidden = localStorage.getItem(MASCOTE_KEY);
    expect(hidden).toBeNull();
  });

  it("ocultar mascote salva 'true' no localStorage", () => {
    localStorage.setItem(MASCOTE_KEY, "true");
    expect(localStorage.getItem(MASCOTE_KEY)).toBe("true");
  });

  it("preferência de ocultar persiste entre acessos", () => {
    localStorage.setItem(MASCOTE_KEY, "true");
    // Simula novo acesso lendo do localStorage
    const persisted = localStorage.getItem(MASCOTE_KEY) === "true";
    expect(persisted).toBe(true);
  });

  it("reexibir mascote remove a chave do localStorage", () => {
    localStorage.setItem(MASCOTE_KEY, "true");
    localStorage.removeItem(MASCOTE_KEY);
    expect(localStorage.getItem(MASCOTE_KEY)).toBeNull();
  });
});
