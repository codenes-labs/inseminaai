import { describe, expect, it } from "vitest";
import {
  adicionarDias,
  calcularDataDiagnosticoPrevista,
  calcularPrevisaoParto,
  calcularProximaTentativa,
  contarRepeticoes,
  dataDiagnosticoValida,
  dataNaoFutura,
  matrizComInseminacaoPendente,
} from "./calculos";

describe("calculos de inseminação", () => {
  it("calcula data prevista do diagnóstico (+30 dias)", () => {
    expect(calcularDataDiagnosticoPrevista("2026-01-15")).toBe("2026-02-14");
  });

  it("calcula previsão de parto (+283 dias) inclusive virada de ano", () => {
    expect(calcularPrevisaoParto("2026-01-01")).toBe("2026-10-11");
  });

  it("adicionarDias trata fevereiro", () => {
    expect(adicionarDias("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("rejeita data futura", () => {
    expect(dataNaoFutura("2026-11-04", "2026-11-04")).toBe(true);
    expect(dataNaoFutura("2026-11-05", "2026-11-04")).toBe(false);
  });

  it("valida data do diagnóstico", () => {
    expect(dataDiagnosticoValida("2026-10-01", "2026-10-15")).toBe(true);
    expect(dataDiagnosticoValida("2026-10-15", "2026-10-01")).toBe(false);
  });

  it("primeira tentativa é 1", () => {
    expect(calcularProximaTentativa([])).toBe(1);
  });

  it("incrementa tentativa quando a última ficou vazia", () => {
    expect(
      calcularProximaTentativa([{ numeroTentativa: 1, status: "vazia" }]),
    ).toBe(2);
    expect(
      calcularProximaTentativa([
        { numeroTentativa: 1, status: "vazia" },
        { numeroTentativa: 2, status: "vazia" },
      ]),
    ).toBe(3);
  });

  it("mantém tentativa atual se a última ainda está pendente", () => {
    expect(
      calcularProximaTentativa([
        { numeroTentativa: 1, status: "vazia" },
        { numeroTentativa: 2, status: "pendente" },
      ]),
    ).toBe(2);
  });

  it("conta repetições como tentativas menos um", () => {
    expect(contarRepeticoes([{ numeroTentativa: 3, status: "pendente" }])).toBe(2);
  });

  it("detecta inseminação pendente", () => {
    expect(matrizComInseminacaoPendente([{ numeroTentativa: 1, status: "pendente" }])).toBe(
      true,
    );
    expect(matrizComInseminacaoPendente([{ numeroTentativa: 1, status: "prenhe" }])).toBe(false);
  });
});
