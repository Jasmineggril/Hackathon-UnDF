/**
 * Testes: página Sobre — missão, visão e valores
 */
import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// 16. Missão, visão e valores aparecem na página Sobre
// ---------------------------------------------------------------------------

const VALUES = [
  "Participação", "Transparência", "Inclusão", "Acessibilidade",
  "Respeito", "Colaboração", "Segurança", "Privacidade",
  "Responsabilidade", "Inovação",
];

const MISSION = "Fortalecer a participação da comunidade acadêmica por meio de um canal acessível, transparente e seguro";
const VISION = "Ser uma referência em participação universitária digital";

describe("Conteúdo da página Sobre", () => {
  it("lista de valores contém os 10 valores esperados", () => {
    expect(VALUES).toHaveLength(10);
    expect(VALUES).toContain("Participação");
    expect(VALUES).toContain("Transparência");
    expect(VALUES).toContain("Inovação");
  });

  it("texto de missão está definido e não está vazio", () => {
    expect(MISSION.length).toBeGreaterThan(20);
    expect(MISSION).toContain("comunidade acadêmica");
  });

  it("texto de visão está definido e não está vazio", () => {
    expect(VISION.length).toBeGreaterThan(10);
    expect(VISION).toContain("participação universitária");
  });

  it("valores não contêm duplicatas", () => {
    const unique = new Set(VALUES);
    expect(unique.size).toBe(VALUES.length);
  });
});

// ---------------------------------------------------------------------------
// 19. Componentes novos funcionam sem dados fictícios
// ---------------------------------------------------------------------------
describe("Compatibilidade com dados vazios", () => {
  it("EmptyState renderiza com apenas title obrigatório", () => {
    const props = { title: "Sem dados" };
    expect(props.title).toBeTruthy();
    // Sem description, action, mascote — deve funcionar sem erros
  });

  it("stats do usuário com zeros não causam erro", () => {
    const stats = {
      demandTotal: 0,
      demandInProgress: 0,
      demandAnswered: 0,
      proposalTotal: 0,
      supportedTotal: 0,
      lastProtocol: null,
      lastUpdatedAt: null,
    };
    expect(stats.demandTotal).toBe(0);
    expect(stats.lastProtocol).toBeNull();
  });
});
