import { describe, expect, it } from "vitest";
import {
  contarDatasNoIntervalo,
  contarDiagnosticosVencendoEmDias,
  contarMatrizesAtivasPorSituacao,
  intervaloMesCalendario,
  ordenarProximosPartos,
} from "./dashboard";

describe("SPEC-08 dashboard", () => {
  it("conta inseminações no mês civil", () => {
    const { inicio, fim } = intervaloMesCalendario("2026-11-20");
    expect(inicio).toBe("2026-11-01");
    expect(fim).toBe("2026-11-30");
    const datas = [
      "2026-10-31",
      "2026-11-01",
      "2026-11-20",
      "2026-12-01",
    ];
    expect(contarDatasNoIntervalo(datas, inicio, fim)).toBe(2);
  });

  it("conta diagnósticos na janela de 7 dias", () => {
    const hoje = "2026-11-20";
    const datas = [
      "2026-11-19",
      "2026-11-20",
      "2026-11-25",
      "2026-11-27",
      "2026-11-28",
    ];
    expect(contarDiagnosticosVencendoEmDias(datas, hoje, 7)).toBe(3);
  });

  it("ordena partos previstos por data crescente", () => {
    const ordenado = ordenarProximosPartos(
      [
        {
          matrizId: "2",
          nome: "B",
          brinco: null,
          previsaoParto: "2027-06-01",
        },
        {
          matrizId: "1",
          nome: "A",
          brinco: "01",
          previsaoParto: "2027-04-15",
        },
        {
          matrizId: "3",
          nome: "C",
          brinco: null,
          previsaoParto: "2026-11-01",
        },
      ],
      "2026-11-20",
    );
    expect(ordenado.map((p) => p.nome)).toEqual(["A", "B"]);
    expect(ordenado[0]?.dias).toBeGreaterThan(0);
    expect(ordenado[0]?.dataBr).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("agrega situação das matrizes ativas", () => {
    const totais = contarMatrizesAtivasPorSituacao([
      { ativa: true, situacao: "pendente" },
      { ativa: true, situacao: "pendente" },
      { ativa: true, situacao: "prenhe" },
      { ativa: false, situacao: "pendente" },
      { ativa: true, situacao: "vazia" },
    ]);
    expect(totais).toEqual({ aguardando: 2, prenhes: 1, vazias: 1 });
  });
});