import { adicionarDias } from "./calculos";

/** Padrão fixo (SPEC-04) quando a matriz ainda não tem histórico de diagnóstico. */
export const DIAS_DIAGNOSTICO_PADRAO = 30;

export const DIAS_DIAGNOSTICO_MIN = 7;
export const DIAS_DIAGNOSTICO_MAX = 60;

export type DiagnosticoHistorico = {
  dataInseminacao: string;
  dataDiagnostico: string;
};

function parseMs(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function diasEntreDatas(inicio: string, fim: string): number {
  const diff = parseMs(fim) - parseMs(inicio);
  return Math.round(diff / 86_400_000);
}

export function limitarDiasDiagnostico(dias: number): number {
  return Math.min(DIAS_DIAGNOSTICO_MAX, Math.max(DIAS_DIAGNOSTICO_MIN, dias));
}

/** Média arredondada dos dias entre IA e diagnóstico já registrados na matriz. */
export function inferirDiasDiagnosticoDaMatriz(
  historico: DiagnosticoHistorico[],
): number | null {
  if (historico.length === 0) return null;
  const desvios = historico
    .map((h) => diasEntreDatas(h.dataInseminacao, h.dataDiagnostico))
    .filter((d) => d >= DIAS_DIAGNOSTICO_MIN && d <= DIAS_DIAGNOSTICO_MAX);
  if (desvios.length === 0) return null;
  const media = desvios.reduce((a, b) => a + b, 0) / desvios.length;
  return limitarDiasDiagnostico(Math.round(media));
}

export function calcularDataDiagnosticoPrevistaParaMatriz(
  dataInseminacao: string,
  historicoDiagnostico: DiagnosticoHistorico[],
): { dataPrevista: string; diasUsados: number; aprendido: boolean } {
  const aprendido = inferirDiasDiagnosticoDaMatriz(historicoDiagnostico);
  const diasUsados = aprendido ?? DIAS_DIAGNOSTICO_PADRAO;
  return {
    dataPrevista: adicionarDias(dataInseminacao, diasUsados),
    diasUsados,
    aprendido: aprendido !== null,
  };
}