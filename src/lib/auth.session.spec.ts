import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CADASTRO_DEMO_ID } from "../server/auth/account-seed";
import { MENSAGEM_LOGIN_INVALIDO } from "./auth-types";
import {
  gravarSessaoApi,
  lerSessao,
  limparSessao,
  obterCadastroId,
  sessaoValida,
} from "./auth-session";
import { STORAGE_KEY } from "./auth-types";

const memoria = new Map<string, string>();

describe("sessão do cliente", () => {
  beforeEach(() => {
    memoria.clear();
    vi.stubGlobal("sessionStorage", {
      getItem: (chave: string) => memoria.get(chave) ?? null,
      setItem: (chave: string, valor: string) => {
        memoria.set(chave, valor);
      },
      removeItem: (chave: string) => {
        memoria.delete(chave);
      },
      clear: () => memoria.clear(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("expõe cadastro_id da sessão", () => {
    gravarSessaoApi(
      "token-teste",
      {
        email: "teste@teste.com",
        nome: "Demo",
        cadastro_id: CADASTRO_DEMO_ID,
        papel: "inseminador",
        demo: true,
      },
      Math.floor(Date.now() / 1000) + 3600,
    );
    expect(obterCadastroId()).toBe(CADASTRO_DEMO_ID);
  });

  it("bloqueia sem sessão válida", () => {
    expect(sessaoValida()).toBe(false);
    expect(lerSessao()).toBeNull();
  });

  it("expira após idle de 2 h", () => {
    vi.useFakeTimers();
    const base = new Date("2026-01-01T12:00:00Z");
    vi.setSystemTime(base);
    gravarSessaoApi(
      "token-idle",
      {
        email: "teste@teste.com",
        nome: "Demo",
        cadastro_id: CADASTRO_DEMO_ID,
        papel: "inseminador",
        demo: true,
      },
      Math.floor(base.getTime() / 1000) + 36000,
    );
    expect(sessaoValida()).toBe(true);
    vi.setSystemTime(new Date(base.getTime() + 2 * 60 * 60 * 1000 + 1));
    expect(sessaoValida()).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("mensagem de login inválido é genérica", () => {
    expect(MENSAGEM_LOGIN_INVALIDO).not.toMatch(/e-mail|senha/i);
    limparSessao();
  });
});