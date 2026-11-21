import { describe, expect, it } from "vitest";
import {
  CABECALHO_EXPORTACAO_CSV,
  formatarDataIsoParaBr,
  formatarLinhaExportacaoCsv,
  mapTipoInseminacaoParaExportacao,
  montarCsvInseminacoes,
} from "./exportacao-csv";

const linhaBase = {
  matriz: "Madame",
  brinco: "0142",
  reprodutor: "Netuno",
  inseminador: "Vitor",
  data: "02/10/2026",
  tipo: "IATF",
  lote: "",
};

describe("exportacao CSV inseminações", () => {
  it("monta arquivo com cabeçalho", () => {
    const csv = montarCsvInseminacoes([linhaBase]);
    expect(csv).toContain(CABECALHO_EXPORTACAO_CSV);
    expect(csv).toContain("Madame");
  });

  it("escapa aspas e ponto e vírgula", () => {
    const linha = formatarLinhaExportacaoCsv({
      ...linhaBase,
      matriz: 'Ana "B"',
      lote: "A;B",
    });
    expect(linha).toContain('"Ana ""B"""');
    expect(linha).toContain('"A;B"');
  });

  it("formata data ISO e tipo", () => {
    expect(formatarDataIsoParaBr("2026-10-02")).toBe("02/10/2026");
    expect(formatarDataIsoParaBr("inválido")).toBe("inválido");
    expect(mapTipoInseminacaoParaExportacao("PROTOCOLO")).toBe("Protocolo");
    expect(mapTipoInseminacaoParaExportacao("IATF")).toBe("IATF");
  });
});