import { describe, expect, it } from "vitest";
import {
  CADASTRO_ADMIN_ID,
  CADASTRO_DEMO_ID,
  USER_ADMIN_ID,
  cadastroBloqueiaExclusao,
  cadastroBloqueiaInativacao,
  cadastroProtegidoSistema,
  mensagemBloqueioExclusao,
  mensagemBloqueioInativacao,
  usuarioProtegidoSistema,
} from "./cadastros-sistema";

const OUTRO = "00000000-0000-4000-8000-000000000099";

describe("cadastros do sistema", () => {
  it("protege admin e demo", () => {
    expect(cadastroProtegidoSistema(CADASTRO_ADMIN_ID)).toBe(true);
    expect(cadastroProtegidoSistema(CADASTRO_DEMO_ID)).toBe(true);
    expect(cadastroProtegidoSistema(OUTRO)).toBe(false);
  });

  it("bloqueia inativar só o admin", () => {
    expect(cadastroBloqueiaInativacao(CADASTRO_ADMIN_ID)).toBe(true);
    expect(cadastroBloqueiaInativacao(CADASTRO_DEMO_ID)).toBe(false);
    expect(cadastroBloqueiaInativacao(OUTRO)).toBe(false);
  });

  it("bloqueia excluir admin e demo", () => {
    expect(cadastroBloqueiaExclusao(CADASTRO_ADMIN_ID)).toBe(true);
    expect(cadastroBloqueiaExclusao(CADASTRO_DEMO_ID)).toBe(true);
    expect(cadastroBloqueiaExclusao(OUTRO)).toBe(false);
  });

  it("protege usuários seed", () => {
    expect(usuarioProtegidoSistema(USER_ADMIN_ID)).toBe(true);
    expect(usuarioProtegidoSistema("outro")).toBe(false);
  });

  it("mensagens de bloqueio são específicas por cadastro", () => {
    expect(mensagemBloqueioInativacao(CADASTRO_ADMIN_ID)).toContain("administrador");
    expect(mensagemBloqueioInativacao(OUTRO)).toContain("não pode ser inativado");
    expect(mensagemBloqueioExclusao(CADASTRO_ADMIN_ID)).toContain("administrador");
    expect(mensagemBloqueioExclusao(CADASTRO_DEMO_ID)).toContain("demo");
    expect(mensagemBloqueioExclusao(OUTRO)).toContain("sistema");
  });
});