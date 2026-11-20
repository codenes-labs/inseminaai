import { describe, expect, it } from "vitest";
import {
  DIAS_DIAGNOSTICO_PADRAO,
  calcularDataDiagnosticoPrevistaParaMatriz,
  diasEntreDatas,
  inferirDiasDiagnosticoDaMatriz,
} from "./previsao-diagnostico";

describe("previsão de diagnóstico por matriz", () => {
  it("usa 30 dias sem histórico", () => {
    const r = calcularDataDiagnosticoPrevistaParaMatriz("2026-11-01", []);
    expect(r.diasUsados).toBe(DIAS_DIAGNOSTICO_PADRAO);
    expect(r.aprendido).toBe(false);
    expect(r.dataPrevista).toBe("2026-12-01");
  });

  it("ajusta pela média dos diagnósticos anteriores", () => {
    const historico = [
      { dataInseminacao: "2026-01-01", dataDiagnostico: "2026-01-11" },
      { dataInseminacao: "2026-03-01", dataDiagnostico: "2026-03-12" },
    ];
    expect(inferirDiasDiagnosticoDaMatriz(historico)).toBe(11);
    const r = calcularDataDiagnosticoPrevistaParaMatriz("2026-11-01", historico);
    expect(r.aprendido).toBe(true);
    expect(r.diasUsados).toBe(11);
    expect(r.dataPrevista).toBe("2026-11-12");
  });

  it("conta dias entre datas", () => {
    expect(diasEntreDatas("2026-11-01", "2026-11-11")).toBe(10);
  });
});