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

  it("aceita tipo empresa", () => {
    expect(
      validarProvisionarCadastroAutonomo({
        nomeCadastro: "Fazenda Sol",
        nomeUsuario: "Ana",
        email: "ana@fazenda.com",
        senha: "senha1234",
        tipo: "empresa",
      }),
    ).toBeNull();
  });

  it("rejeita tipo inválido", () => {
    expect(
      validarProvisionarCadastroAutonomo({
        nomeCadastro: "X",
        nomeUsuario: "Y",
        email: "a@b.co",
        senha: "senha1234",
        tipo: "pf" as "autonomo",
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