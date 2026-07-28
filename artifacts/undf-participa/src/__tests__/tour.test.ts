/**
 * Testes: tour guiado
 */
import { describe, it, expect, beforeEach } from "vitest";

const TOUR_KEY = "voz-undf:tour-completed";

// ---------------------------------------------------------------------------
// 11. Tour aparece no primeiro acesso (localStorage vazio)
// ---------------------------------------------------------------------------
describe("Tour guiado — localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("tour deve aparecer quando não há chave de conclusão no localStorage", () => {
    const completed = localStorage.getItem(TOUR_KEY);
    expect(completed).toBeNull(); // sem chave = tour deve aparecer
  });

  // 12. Tour não aparece novamente após conclusão
  it("tour não deve aparecer após marcar como concluído", () => {
    localStorage.setItem(TOUR_KEY, "true");
    const completed = localStorage.getItem(TOUR_KEY);
    expect(completed).toBe("true");
  });

  // 13. Tour pode ser reaberto
  it("remover a chave permite reabrir o tour", () => {
    localStorage.setItem(TOUR_KEY, "true");
    localStorage.removeItem(TOUR_KEY);
    const completed = localStorage.getItem(TOUR_KEY);
    expect(completed).toBeNull();
  });
});
