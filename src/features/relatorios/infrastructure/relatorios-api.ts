import { apiFetch } from "../../../lib/api-client";
import type { PeriodoRelatorio } from "../domain/periodo";
import {
  montarQueryRelatorios,
  type ConsultaRelatorios,
} from "./consulta-periodo";

export type ResumoRelatoriosApi = {
  periodo: PeriodoRelatorio;
  taxaPrenhezGeral: number;
  prenhes: number;
  diagnosticadas: number;
  inseminadasMes: number;
  pendentes: number;
  porSituacao: {
    prenhe: number;
    pendente: number;
    vazia: number;
    sem: number;
  };
  taxaPorReprodutor: {
    chave: string;
    taxaPercentual: number;
    diagnosticadas: number;
  }[];
  taxaPorTipo: {
    chave: string;
    taxaPercentual: number;
    diagnosticadas: number;
  }[];
  taxaPorLote: {
    chave: string;
    taxaPercentual: number;
    diagnosticadas: number;
  }[];
  mediaRepeticoes: number;
};

export async function obterResumoRelatoriosApi(
  consulta: ConsultaRelatorios,
): Promise<ResumoRelatoriosApi> {
  const query = montarQueryRelatorios(consulta);
  const response = await apiFetch(`/api/relatorios/resumo?${query}`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os relatórios.");
  }
  return (await response.json()) as ResumoRelatoriosApi;
}

export async function baixarCsvInseminacoes(
  consulta: ConsultaRelatorios,
): Promise<Blob> {
  const query = montarQueryRelatorios(consulta);
  const response = await apiFetch(`/api/relatorios/inseminacoes.csv?${query}`);
  if (!response.ok) {
    throw new Error("Não foi possível exportar o CSV.");
  }
  return response.blob();
}