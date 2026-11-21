import { describe, expect, it } from "vitest";
import { normalizarTextoBusca, textoBuscaCoincide } from "./busca";

describe("busca de matrizes", () => {
  it("normaliza acentos e caixa", () => {
    expect(normalizarTextoBusca("  José  ")).toBe("jose");
  });

  it("consulta vazia aceita tudo", () => {
    expect(textoBuscaCoincide("Boneca", "   ")).toBe(true);
  });

  it("encontra substring normalizada", () => {
    expect(textoBuscaCoincide("Madame", "dam")).toBe(true);
    expect(textoBuscaCoincide("Madame", "xyz")).toBe(false);
  });
});