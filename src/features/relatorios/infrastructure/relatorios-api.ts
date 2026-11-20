import { apiFetch } from "../../../lib/api-client";

export type ResumoRelatoriosApi = {
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

export async function obterResumoRelatoriosApi(): Promise<ResumoRelatoriosApi> {
  const response = await apiFetch("/api/relatorios/resumo");
  if (!response.ok) {
    throw new Error("Não foi possível carregar os relatórios.");
  }
  return (await response.json()) as ResumoRelatoriosApi;
}

export async function baixarCsvInseminacoes(): Promise<Blob> {
  const response = await apiFetch("/api/relatorios/inseminacoes.csv");
  if (!response.ok) {
    throw new Error("Não foi possível exportar o CSV.");
  }
  return response.blob();
}