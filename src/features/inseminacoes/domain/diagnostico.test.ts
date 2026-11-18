import { describe, expect, it } from "vitest";
import {
  calcularCamposDiagnostico,
  ERRO_DATA_DIAGNOSTICO_ANTERIOR,
  validarRegistroDiagnostico,
} from "./diagnostico";
import { calcularPrevisaoParto } from "./calculos";

describe("registro de diagnóstico (SPEC-05)", () => {
  it("previsão de parto com 283 dias a partir da inseminação", () => {
    expect(calcularPrevisaoParto("2026-01-01")).toBe("2026-10-11");
    const campos = calcularCamposDiagnostico(
      "2026-01-01",
      "2026-02-01",
      "prenhe",
    );
    expect(campos.previsao_parto).toBe("2026-10-11");
  });

  it("vazia não gera previsão de parto", () => {
    const campos = calcularCamposDiagnostico(
      "2026-03-10",
      "2026-04-15",
      "vazia",
    );
    expect(campos.previsao_parto).toBeNull();
    expect(campos.status).toBe("vazia");
  });

  it("rejeita data do diagnóstico anterior à inseminação", () => {
    expect(
      validarRegistroDiagnostico({
        dataInseminacao: "2026-10-15",
        dataDiagnostico: "2026-10-01",
        resultado: "prenhe",
        hoje: "2026-10-20",
      }),
    ).toBe(ERRO_DATA_DIAGNOSTICO_ANTERIOR);
  });

  it("aceita data do diagnóstico no mesmo dia da inseminação", () => {
    expect(
      validarRegistroDiagnostico({
        dataInseminacao: "2026-10-01",
        dataDiagnostico: "2026-10-01",
        resultado: "prenhe",
        hoje: "2026-10-15",
      }),
    ).toBeNull();
  });
});