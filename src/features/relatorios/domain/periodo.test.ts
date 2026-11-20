import { describe, expect, it } from "vitest";
import {
  formatarPeriodoBr,
  formatarPeriodoCampo,
  limitesDoMes,
  ordenarPeriodo,
  periodoAteHoje,
  periodoMesDe,
  resolverPeriodoRelatorio,
} from "./periodo";

describe("periodo relatorio", () => {
  it("limites do mes de novembro", () => {
    expect(limitesDoMes("2025-11")).toEqual({
      inicio: "2025-11-01",
      fim: "2025-11-30",
    });
  });

  it("periodo a partir de um dia usa o mes inteiro por padrao via resolver mes", () => {
    expect(resolverPeriodoRelatorio({ mes: "2025-10", hoje: "2025-11-20" })).toEqual({
      inicio: "2025-10-01",
      fim: "2025-10-31",
    });
  });

  it("intervalo personalizado", () => {
    expect(
      resolverPeriodoRelatorio({
        de: "2025-11-01",
        ate: "2025-11-15",
      }),
    ).toEqual({ inicio: "2025-11-01", fim: "2025-11-15" });
  });

  it("sem parametros usa mes de hoje", () => {
    expect(resolverPeriodoRelatorio({ hoje: "2025-11-20" })).toEqual(
      periodoMesDe("2025-11-20"),
    );
  });

  it("formata periodo em pt-BR", () => {
    expect(
      formatarPeriodoBr({ inicio: "2025-11-01", fim: "2025-11-30" }),
    ).toBe("01/11/2025 a 30/11/2025");
  });

  it("formata campo com travessão", () => {
    expect(
      formatarPeriodoCampo({ inicio: "2026-01-10", fim: "2026-03-08" }),
    ).toBe("10/01/2026 - 08/03/2026");
  });

  it("ordena intervalo invertido", () => {
    expect(ordenarPeriodo("2025-11-15", "2025-11-01")).toEqual({
      inicio: "2025-11-01",
      fim: "2025-11-15",
    });
  });

  it("atalho ate hoje no mes", () => {
    expect(periodoAteHoje("2025-11-20")).toEqual({
      inicio: "2025-11-01",
      fim: "2025-11-20",
    });
  });
});