import { describe, expect, it } from "vitest";
import { validarCriarMembroCadastro } from "./criar-membro-cadastro";

describe("criar membro no cadastro (SPEC-20)", () => {
  it("aceita payload válido", () => {
    expect(
      validarCriarMembroCadastro({
        nome: "João Inseminador",
        email: "joao@exemplo.com.br",
        senha: "senha1234",
        papel: "inseminador",
      }),
    ).toBeNull();
  });

  it("rejeita papel inválido", () => {
    expect(
      validarCriarMembroCadastro({
        nome: "João",
        email: "joao@exemplo.com.br",
        senha: "senha1234",
        papel: "gerente" as "inseminador",
      }),
    ).not.toBeNull();
  });
});