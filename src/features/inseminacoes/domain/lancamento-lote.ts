import { validarDataInseminacao } from "./registrar";

export const ERRO_LOTE_SEM_MATRIZ = "Marque ao menos uma matriz.";
export const ERRO_LOTE_MUITAS_MATRIZES = "No máximo 50 matrizes por lote.";

export const LIMITE_MATRIZES_LOTE = 50;

export type EntradaLancamentoLote = {
  matriz_ids: string[];
  data: string;
  tipo: string;
  reprodutor_id: string;
  inseminador_id: string;
  hoje: string;
};

export function normalizarIdsMatrizes(ids: string[]): string[] {
  const vistos = new Set<string>();
  const saida: string[] = [];
  for (const id of ids) {
    const t = id.trim();
    if (!t || vistos.has(t)) continue;
    vistos.add(t);
    saida.push(t);
  }
  return saida;
}

export function validarLancamentoLote(
  entrada: EntradaLancamentoLote,
): string | null {
  const matrizes = normalizarIdsMatrizes(entrada.matriz_ids);
  if (matrizes.length === 0) return ERRO_LOTE_SEM_MATRIZ;
  if (matrizes.length > LIMITE_MATRIZES_LOTE) return ERRO_LOTE_MUITAS_MATRIZES;
  const erroData = validarDataInseminacao(entrada.data, entrada.hoje);
  if (erroData) return erroData;
  if (!entrada.reprodutor_id.trim()) return "Selecione o reprodutor.";
  if (!entrada.inseminador_id.trim()) return "Selecione o inseminador.";
  if (!entrada.tipo.trim()) return "Selecione o tipo.";
  return null;
}

export function quantidadeRegistrosLote(matriz_ids: string[]): number {
  return normalizarIdsMatrizes(matriz_ids).length;
}

/** Quais matrizes selecionadas já têm IA pendente (aviso na UI). */
export function matrizesComPendenciaNoLote(
  selecionadas: string[],
  comPendencia: string[],
): string[] {
  const pendente = new Set(comPendencia);
  return normalizarIdsMatrizes(selecionadas).filter((id) => pendente.has(id));
}