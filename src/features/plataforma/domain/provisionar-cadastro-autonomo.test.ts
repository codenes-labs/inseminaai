import { describe, expect, it } from "vitest";
import { validarProvisionarCadastroAutonomo } from "./provisionar-cadastro-autonomo";

describe("provisionar cadastro autônomo (SPEC-21)", () => {
  it("aceita payload válido", () => {
    expect(
      validarProvisionarCadastroAutonomo({
        nomeCadastro: "Vitor Bezerra",
        nomeUsuario: "Vitor Bezerra",
        email: "vitor@exemplo.com.br",
        senha: "senha1234",
      }),
    ).toBeNull();
  });

  it("rejeita e-mail inválido", () => {
    expect(
      validarProvisionarCadastroAutonomo({
        nomeCadastro: "Vitor",
        nomeUsuario: "Vitor",
        email: "invalido",
        senha: "senha1234",
      }),
    ).not.toBeNull();
  });

  it("rejeita senha curta", () => {
    expect(
      validarProvisionarCadastroAutonomo({
        nomeCadastro: "Vitor",
        nomeUsuario: "Vitor",
        email: "vitor@exemplo.com.br",
        senha: "123",
      }),
    ).not.toBeNull();
  });
});