import { describe, expect, it } from "vitest";
import {
  contaPodeEntrarModoPlataforma,
  resolverDestinoPosLogin,
} from "./resolver-destino-pos-login";

describe("resolver destino pós-login (SPEC-22)", () => {
  it("modo app manda produtor para inicio", () => {
    expect(
      resolverDestinoPosLogin(
        { plataformaAdmin: false, papel: "administrador" },
        "app",
      ),
    ).toBe("/inicio");
  });

  it("modo app manda plataforma para admin", () => {
    expect(
      resolverDestinoPosLogin(
        { plataformaAdmin: true, papel: "administrador" },
        "app",
      ),
    ).toBe("/admin/cadastros");
  });

  it("modo app plataforma respeita preview do produtor", () => {
    expect(
      resolverDestinoPosLogin(
        { plataformaAdmin: true, papel: "administrador" },
        "app",
        { modoAppPlataforma: true },
      ),
    ).toBe("/inicio");
  });

  it("modo plataforma exige flag", () => {
    expect(contaPodeEntrarModoPlataforma(false)).toBe(false);
    expect(
      resolverDestinoPosLogin(
        { plataformaAdmin: true, papel: "administrador" },
        "plataforma",
      ),
    ).toBe("/admin/cadastros");
  });
});