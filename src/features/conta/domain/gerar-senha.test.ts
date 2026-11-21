import { describe, expect, it } from "vitest";
import { gerarSenhaSugerida, senhaNovaValida } from "./gerar-senha";

describe("gerarSenhaSugerida", () => {
  it("respeita comprimento", () => {
    expect(gerarSenhaSugerida(12)).toHaveLength(12);
  });

  it("valida minimo", () => {
    expect(senhaNovaValida("1234567")).toBe(false);
    expect(senhaNovaValida("12345678")).toBe(true);
  });

  it("rejeita comprimento abaixo de 8", () => {
    expect(() => gerarSenhaSugerida(7)).toThrow("Comprimento mínimo é 8.");
  });
});