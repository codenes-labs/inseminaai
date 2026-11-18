import { describe, expect, it } from "vitest";
import {
  filtrarAtivos,
  validarNomeCadastro,
} from "./validacao";

describe("cadastros auxiliares", () => {
  it("valida nome obrigatório", () => {
    expect(validarNomeCadastro("")).not.toBeNull();
    expect(validarNomeCadastro("Anthonny")).toBeNull();
  });

  it("filtra somente ativos", () => {
    const itens = [
      { id: "1", nome: "A", ativo: true },
      { id: "2", nome: "B", ativo: false },
    ];
    expect(filtrarAtivos(itens, true)).toHaveLength(1);
    expect(filtrarAtivos(itens, true)[0]?.nome).toBe("A");
    expect(filtrarAtivos(itens, false)).toHaveLength(2);
  });
});