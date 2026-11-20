import { describe, expect, it } from "vitest";
import {
  agruparTaxaPrenhez,
  calcularTaxaPrenhez,
  mediaRepeticoesPorMatriz,
} from "./taxas";
import { formatarLinhaExportacaoCsv, montarCsvInseminacoes } from "./exportacao-csv";

describe("SPEC-10 relatórios", () => {
  it("formata colunas do CSV", () => {
    const linha = formatarLinhaExportacaoCsv({
      matriz: "Madame",
      brinco: "0142",
      reprodutor: "Netuno",
      inseminador: "Vitor",
      data: "02/10/2026",
      tipo: "IATF",
      lote: "Lote 1; teste",
    });
    expect(linha).toContain('"Lote 1; teste"');
    const csv = montarCsvInseminacoes([
      {
        matriz: "A",
        brinco: "",
        reprodutor: "R",
        inseminador: "I",
        data: "01/01/2026",
        tipo: "CN",
        lote: "",
      },
    ]);
    expect(csv.startsWith("matriz;brinco;")).toBe(true);
  });

  it("taxa com divisão por zero", () => {
    expect(calcularTaxaPrenhez(0, 0)).toBe(0);
    expect(calcularTaxaPrenhez(2, 4)).toBe(50);
  });

  it("agrupa taxas e média de repetições", () => {
    const grupos = agruparTaxaPrenhez([
      { grupo: "Netuno", prenhe: true, diagnosticada: true },
      { grupo: "Netuno", prenhe: false, diagnosticada: true },
    ]);
    expect(grupos[0]?.taxaPercentual).toBe(50);
    expect(mediaRepeticoesPorMatriz([1, 3, 2])).toBe(1);
  });
});