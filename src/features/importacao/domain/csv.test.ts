import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  chaveIdempotenciaImportacao,
  deduplicarMatrizesPorNome,
  montarPlanoImportacao,
  parsearCsv,
  parsearDataCsv,
  tentativasAnterioresParaVazia,
} from "./csv";

describe("parse de datas do CSV", () => {
  it("aceita dd/MM/yyyy", () => {
    expect(parsearDataCsv("02/10/2026")).toBe("2026-10-02");
  });

  it("aceita ISO", () => {
    expect(parsearDataCsv("2026-10-02")).toBe("2026-10-02");
  });

  it("rejeita formato inválido", () => {
    expect(parsearDataCsv("10-02-2026")).toBeNull();
  });
});

describe("parse e deduplicação", () => {
  it("deduplica matrizes pelo nome", () => {
    const linhas = parsearCsv(`matriz;brinco;reprodutor;inseminador;data;tipo;lote
A;1;R;I;01/01/2026;CN;
A;2;R;I;02/02/2026;CN;`);
    const mapa = deduplicarMatrizesPorNome(linhas);
    expect(mapa.size).toBe(1);
    expect(mapa.get("a")?.nome).toBe("A");
  });

  it("mapeia repetições para tentativas em ordem de data", () => {
    const { linhas } = montarPlanoImportacao(
      parsearCsv(`matriz;brinco;reprodutor;inseminador;data;tipo;lote
M;1;R;I;15/08/2026;CN;
M;1;R;I;01/06/2026;CN;`),
    );
    expect(linhas.map((l) => l.numeroTentativa)).toEqual([1, 2]);
    expect(linhas[0].dataIso).toBe("2026-06-01");
    expect(linhas[1].dataIso).toBe("2026-08-15");
  });

  it("gera chave de idempotência estável", () => {
    expect(
      chaveIdempotenciaImportacao("Madame", "2026-10-02", 1),
    ).toBe("madame|2026-10-02|1");
  });

  it("repetição marca tentativas anteriores como vazias", () => {
    expect(tentativasAnterioresParaVazia(3)).toEqual([1, 2]);
  });

  it("parseia fixture de exemplo", () => {
    const path = join(
      process.cwd(),
      "docs/fixtures/importacao-exemplo.csv",
    );
    const linhas = parsearCsv(readFileSync(path, "utf8"));
    const plano = montarPlanoImportacao(linhas);
    expect(plano.erros).toEqual([]);
    expect(plano.linhas.some((l) => l.numeroTentativa === 2)).toBe(true);
  });
});