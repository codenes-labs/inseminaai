import { dataNaoFutura } from "./calculos";

export const ERRO_DATA_FUTURA = "A data não pode ser no futuro.";
export const ERRO_MATRIZ_OBRIGATORIA = "Selecione a matriz.";
export const ERRO_REPRODUTOR_OBRIGATORIO = "Selecione o reprodutor.";
export const ERRO_INSEMINADOR_OBRIGATORIO = "Selecione o inseminador.";

export function validarDataInseminacao(data: string, hoje: string): string | null {
  if (!data.trim()) return "Informe a data.";
  if (!dataNaoFutura(data, hoje)) return ERRO_DATA_FUTURA;
  return null;
}

export const STATUS_INICIAL_INSEMINACAO = "pendente" as const;