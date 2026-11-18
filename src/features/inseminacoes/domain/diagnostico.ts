import {
  calcularPrevisaoParto,
  dataDiagnosticoValida,
  dataNaoFutura,
} from "./calculos";
import { ERRO_DATA_FUTURA } from "./registrar";

export const ERRO_DATA_DIAGNOSTICO_ANTERIOR =
  "A data do diagnóstico não pode ser anterior à inseminação.";
export const ERRO_RESULTADO_DIAGNOSTICO = "Selecione prenhe ou vazia.";

export type ResultadoDiagnostico = "prenhe" | "vazia";

export type CamposDiagnostico = {
  status: ResultadoDiagnostico;
  data_diagnostico: string;
  previsao_parto: string | null;
};

export function validarRegistroDiagnostico(input: {
  dataInseminacao: string;
  dataDiagnostico: string;
  resultado: string;
  hoje: string;
}): string | null {
  if (!input.dataDiagnostico.trim()) {
    return "Informe a data do diagnóstico.";
  }
  if (!dataNaoFutura(input.dataDiagnostico, input.hoje)) {
    return ERRO_DATA_FUTURA;
  }
  if (!dataDiagnosticoValida(input.dataInseminacao, input.dataDiagnostico)) {
    return ERRO_DATA_DIAGNOSTICO_ANTERIOR;
  }
  if (input.resultado !== "prenhe" && input.resultado !== "vazia") {
    return ERRO_RESULTADO_DIAGNOSTICO;
  }
  return null;
}

export function calcularCamposDiagnostico(
  dataInseminacao: string,
  dataDiagnostico: string,
  resultado: ResultadoDiagnostico,
): CamposDiagnostico {
  return {
    status: resultado,
    data_diagnostico: dataDiagnostico,
    previsao_parto:
      resultado === "prenhe" ? calcularPrevisaoParto(dataInseminacao) : null,
  };
}