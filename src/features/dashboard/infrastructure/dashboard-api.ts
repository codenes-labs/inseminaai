import { apiFetch } from "../../../lib/api-client";

export type DashboardApi = {
  inseminadasMes: number;
  aguardando: number;
  prenhes: number;
  vazias: number;
  diagnosticosVencendo7Dias: number;
  proximosPartos: {
    matrizId: string;
    nome: string;
    brinco: string | null;
    dataBr: string;
    dias: number;
  }[];
  ultimasInseminacoes: {
    matrizId: string;
    nome: string;
    brinco: string | null;
    dataBr: string;
    tipo: string;
    reprodutor: string;
  }[];
};

export async function obterDashboardApi(): Promise<DashboardApi> {
  const response = await apiFetch("/api/dashboard");
  if (!response.ok) {
    throw new Error("Não foi possível carregar o início.");
  }
  return (await response.json()) as DashboardApi;
}