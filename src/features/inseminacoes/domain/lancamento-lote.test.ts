import { describe, expect, it } from "vitest";
import {
  ERRO_LOTE_SEM_MATRIZ,
  matrizesComPendenciaNoLote,
  normalizarIdsMatrizes,
  quantidadeRegistrosLote,
  validarLancamentoLote,
} from "./lancamento-lote";

describe("SPEC-09 lançamento em lote", () => {
  const base = {
    matriz_ids: ["a", "b", "a"],
    data: "2026-11-01",
    tipo: "IATF",
    reprodutor_id: "r1",
    inseminador_id: "i1",
    hoje: "2026-11-20",
  };

  it("gera N registros (ids únicos)", () => {
    expect(quantidadeRegistrosLote(base.matriz_ids)).toBe(2);
    expect(normalizarIdsMatrizes([" x ", "x", "y"])).toEqual(["x", "y"]);
  });

  it("exige ao menos uma matriz", () => {
    expect(
      validarLancamentoLote({ ...base, matriz_ids: [] }),
    ).toBe(ERRO_LOTE_SEM_MATRIZ);
  });

  it("avisa matrizes com pendência", () => {
    const aviso = matrizesComPendenciaNoLote(
      ["m1", "m2", "m3"],
      ["m2", "m4"],
    );
    expect(aviso).toEqual(["m2"]);
  });

  it("rejeita data futura", () => {
    expect(
      validarLancamentoLote({ ...base, data: "2026-12-01" }),
    ).toMatch(/futuro/i);
  });
});