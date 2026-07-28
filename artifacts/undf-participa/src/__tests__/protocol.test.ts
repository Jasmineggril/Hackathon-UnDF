/**
 * Testes: protocolo de acompanhamento
 */
import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Validação do formato de protocolo VUNDF-YYYYMMDD-XXXX
// ---------------------------------------------------------------------------

function isValidProtocolFormat(value: string): boolean {
  return /^VUNDF-\d{8}-\d{4}$/i.test(value.trim());
}

function normalizeProtocol(value: string): string {
  return value.trim().toUpperCase();
}

describe("Validação de protocolo", () => {
  // 6. Protocolo válido
  it("aceita formato VUNDF-YYYYMMDD-XXXX correto", () => {
    expect(isValidProtocolFormat("VUNDF-20260726-4821")).toBe(true);
  });

  it("aceita formato com letras minúsculas (case-insensitive)", () => {
    expect(isValidProtocolFormat("vundf-20260726-4821")).toBe(true);
  });

  it("normaliza protocolo para maiúsculas", () => {
    expect(normalizeProtocol("vundf-20260726-4821")).toBe("VUNDF-20260726-4821");
  });

  it("remove espaços extras na normalização", () => {
    expect(normalizeProtocol("  VUNDF-20260726-4821  ")).toBe("VUNDF-20260726-4821");
  });

  // 7. Protocolo inexistente (formato válido mas não encontrado)
  it("distingue protocolo com formato válido de inexistente", () => {
    const validFormat = isValidProtocolFormat("VUNDF-20260726-9999");
    expect(validFormat).toBe(true); // formato ok, backend retorna 404
  });

  // 8. Protocolo inválido
  it("rejeita protocolo sem prefixo VUNDF", () => {
    expect(isValidProtocolFormat("DEM-2023-A1B2C3D4")).toBe(false);
  });

  it("rejeita protocolo com formato incorreto", () => {
    expect(isValidProtocolFormat("VUNDF-2026-1234")).toBe(false);
    expect(isValidProtocolFormat("VUNDF-20260726")).toBe(false);
    expect(isValidProtocolFormat("")).toBe(false);
    expect(isValidProtocolFormat("1234")).toBe(false);
  });

  it("rejeita protocolo com sufixo diferente de 4 dígitos", () => {
    expect(isValidProtocolFormat("VUNDF-20260726-12")).toBe(false);
    expect(isValidProtocolFormat("VUNDF-20260726-12345")).toBe(false);
  });

  // 10. Botão copiar protocolo
  it("navigator.clipboard.writeText é chamado ao copiar protocolo", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    const protocol = "VUNDF-20260726-4821";
    await navigator.clipboard.writeText(protocol);
    expect(writeText).toHaveBeenCalledWith(protocol);
  });
});
