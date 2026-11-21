import { describe, expect, it } from "vitest";
import {
  contaPodeEntrarModoPlataforma,
  resolverDestinoPosLogin,
} from "./resolver-destino-pos-login";

const ID_ADMIN = "admin@codenes.com.br";
const ID_PRODUTOR = "produtor@exemplo.com";

describe("resolver destino pós-login (SPEC-22)", () => {
  it("modo app manda produtor para inicio", () => {
    expect(
      resolverDestinoPosLogin(
        { identificador: ID_PRODUTOR, papel: "administrador" },
        "app",
      ),
    ).toBe("/inicio");
  });

  it("modo app manda admin codenes para admin", () => {
    expect(
      resolverDestinoPosLogin(
        { identificador: ID_ADMIN, papel: "administrador" },
        "app",
      ),
    ).toBe("/admin/cadastros");
  });

  it("modo app plataforma respeita preview do produtor", () => {
    expect(
      resolverDestinoPosLogin(
        { identificador: ID_ADMIN, papel: "administrador" },
        "app",
        { modoAppPlataforma: true },
      ),
    ).toBe("/inicio");
  });

  it("outro e-mail com plataforma_admin no banco ainda vai para inicio", () => {
    expect(
      resolverDestinoPosLogin(
        { identificador: "outro@codenes.com.br", papel: "administrador" },
        "app",
      ),
    ).toBe("/inicio");
  });

  it("modo plataforma exige e-mail codenes", () => {
    expect(contaPodeEntrarModoPlataforma(ID_PRODUTOR)).toBe(false);
    expect(contaPodeEntrarModoPlataforma(ID_ADMIN)).toBe(true);
    expect(
      resolverDestinoPosLogin(
        { identificador: ID_ADMIN, papel: "administrador" },
        "plataforma",
      ),
    ).toBe("/admin/cadastros");
  });
});