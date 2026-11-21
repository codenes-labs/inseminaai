import { describe, expect, it } from "vitest";
import {
  ehAdminPlataformaCodenes,
  mostrarAtalhoCadastrosPlataformaNoApp,
} from "./admin-plataforma-codenes";
import type { Session } from "../../lib/auth-types";

const sessaoBase: Session = {
  token: "t",
  nome: "Admin",
  identificador: "admin@codenes.com.br",
  email: "admin@codenes.com.br",
  papel: "administrador",
  plataformaAdmin: true,
  cadastroId: "",
  expiraEm: Date.now() + 60_000,
};

describe("ehAdminPlataformaCodenes", () => {
  it("reconhece admin@codenes.com.br", () => {
    expect(ehAdminPlataformaCodenes(sessaoBase)).toBe(true);
  });

  it("atalho no app com e-mail codenes mesmo sem flag", () => {
    expect(
      mostrarAtalhoCadastrosPlataformaNoApp({
        ...sessaoBase,
        plataformaAdmin: false,
      }),
    ).toBe(true);
  });

  it("nega outro e-mail com plataforma_admin", () => {
    expect(
      ehAdminPlataformaCodenes({
        ...sessaoBase,
        identificador: "outro@codenes.com.br",
        email: "outro@codenes.com.br",
      }),
    ).toBe(false);
  });
});