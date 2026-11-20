import { describe, expect, it } from "vitest";
import {
  contarRepeticoesMatriz,
  derivarSituacaoDaUltimaInseminacao,
  ordenarLinhaDoTempo,
} from "./resumo-reprodutivo";

describe("SPEC-06 resumo reprodutivo da matriz", () => {
  it("deriva situação a partir da última inseminação por data", () => {
    expect(
      derivarSituacaoDaUltimaInseminacao([
        { data: "2026-08-01", status: "vazia", numeroTentativa: 1 },
        { data: "2026-10-15", status: "pendente", numeroTentativa: 2 },
      ]),
    ).toEqual({
      situacao: "pendente",
      ultimaInseminacaoIso: "2026-10-15",
    });
  });

  it('marca "sem" quando não há inseminações', () => {
    expect(derivarSituacaoDaUltimaInseminacao([])).toEqual({
      situacao: "sem",
      ultimaInseminacaoIso: null,
    });
  });

  it("ordena linha do tempo da mais recente para a mais antiga", () => {
    const ordenado = ordenarLinhaDoTempo([
      { data: "2026-06-01", status: "vazia", numeroTentativa: 1 },
      { data: "2026-10-01", status: "prenhe", numeroTentativa: 2 },
      { data: "2026-08-15", status: "vazia", numeroTentativa: 1 },
    ]);
    expect(ordenado.map((h) => h.data)).toEqual([
      "2026-10-01",
      "2026-08-15",
      "2026-06-01",
    ]);
  });

  it("conta repetições como tentativas menos um", () => {
    expect(
      contarRepeticoesMatriz([
        { data: "2026-06-01", status: "vazia", numeroTentativa: 1 },
        { data: "2026-08-01", status: "vazia", numeroTentativa: 2 },
        { data: "2026-10-01", status: "pendente", numeroTentativa: 3 },
      ]),
    ).toBe(2);
  });
});