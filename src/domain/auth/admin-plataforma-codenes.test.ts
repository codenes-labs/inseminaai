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
    expect(mostrarAtalhoCadastrosPlataformaNoApp(sessaoBase)).toBe(true);
  });

  it("nega outro e-mail mesmo com plataforma_admin", () => {
    const outro = {
      ...sessaoBase,
      identificador: "outro@codenes.com.br",
      email: "outro@codenes.com.br",
      plataformaAdmin: true,
    };
    expect(ehAdminPlataformaCodenes(outro)).toBe(false);
    expect(mostrarAtalhoCadastrosPlataformaNoApp(outro)).toBe(false);
  });

  it("cliente criado pelo admin na plataforma não vê atalho no app", () => {
    expect(
      mostrarAtalhoCadastrosPlataformaNoApp({
        ...sessaoBase,
        identificador: "cliente@fazenda.com",
        email: "cliente@fazenda.com",
        plataformaAdmin: false,
        papel: "administrador",
      }),
    ).toBe(false);
  });
});