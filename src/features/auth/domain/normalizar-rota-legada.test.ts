import { describe, expect, it } from "vitest";
import { normalizarRotaLegada } from "./normalizar-rota-legada";

describe("normalizarRotaLegada (SPEC-22)", () => {
  it("mapeia web usuarios para mais acessos", () => {
    expect(normalizarRotaLegada("/web/usuarios")).toBe("/mais/acessos");
  });

  it("mapeia web cadastros para admin", () => {
    expect(normalizarRotaLegada("/web/cadastros/abc")).toBe("/admin/cadastros/abc");
  });

  it("mantém rotas novas", () => {
    expect(normalizarRotaLegada("/inicio")).toBe("/inicio");
  });
});