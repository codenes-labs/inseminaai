import { describe, expect, it } from "vitest";
import { normalizarTextoBusca, textoBuscaCoincide } from "./busca";
import {
  brincoDuplicadoNoCadastro,
  normalizarBrinco,
  validarNomeMatriz,
} from "./validacao";

describe("validação de matriz", () => {
  it("rejeita nome vazio", () => {
    expect(validarNomeMatriz("")).not.toBeNull();
    expect(validarNomeMatriz("  ")).not.toBeNull();
  });

  it("aceita nome preenchido", () => {
    expect(validarNomeMatriz("Madame")).toBeNull();
  });

  it("rejeita brinco duplicado no mesmo cadastro", () => {
    const existentes = [
      { id: "a", brinco: "0142" },
      { id: "b", brinco: "0157" },
    ];
    expect(brincoDuplicadoNoCadastro("0142", existentes)).toBe(true);
    expect(brincoDuplicadoNoCadastro("0157", existentes, "b")).toBe(false);
  });

  it("aceita o mesmo brinco em cadastros diferentes (só valida lista local)", () => {
    const cadastroA = [{ brinco: "99" }];
    const cadastroB: { brinco: string }[] = [];
    expect(brincoDuplicadoNoCadastro("99", cadastroA)).toBe(true);
    expect(brincoDuplicadoNoCadastro("99", cadastroB)).toBe(false);
  });

  it("brinco vazio vira null", () => {
    expect(normalizarBrinco("  ")).toBeNull();
    expect(normalizarBrinco("0142")).toBe("0142");
  });
});

describe("busca de matrizes", () => {
  it("ignora acentos", () => {
    expect(normalizarTextoBusca("Fumaça")).toBe("fumaca");
    expect(textoBuscaCoincide("Fumaça", "fumaca")).toBe(true);
    expect(textoBuscaCoincide("José", "jose")).toBe(true);
  });
});