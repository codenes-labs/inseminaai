import { describe, expect, it } from "vitest";
import {
  CADASTRO_ADMIN_ID,
  CADASTRO_DEMO_ID,
  USER_ADMIN_ID,
  cadastroProtegidoSistema,
  usuarioProtegidoSistema,
} from "./cadastros-sistema";

describe("cadastros do sistema", () => {
  it("protege admin e demo", () => {
    expect(cadastroProtegidoSistema(CADASTRO_ADMIN_ID)).toBe(true);
    expect(cadastroProtegidoSistema(CADASTRO_DEMO_ID)).toBe(true);
    expect(cadastroProtegidoSistema("00000000-0000-4000-8000-000000000099")).toBe(
      false,
    );
  });

  it("protege usuários seed", () => {
    expect(usuarioProtegidoSistema(USER_ADMIN_ID)).toBe(true);
    expect(usuarioProtegidoSistema("outro")).toBe(false);
  });
});