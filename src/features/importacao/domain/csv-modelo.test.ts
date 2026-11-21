import { describe, expect, it } from "vitest";
import { MODELO_CSV_IMPORTACAO } from "./csv-modelo";

describe("MODELO_CSV_IMPORTACAO", () => {
  it("contém cabeçalho e exemplos", () => {
    expect(MODELO_CSV_IMPORTACAO).toContain("matriz;brinco");
    expect(MODELO_CSV_IMPORTACAO.split("\n").length).toBeGreaterThan(2);
  });
});