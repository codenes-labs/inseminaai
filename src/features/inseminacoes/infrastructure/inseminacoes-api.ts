import { apiFetch } from "../../../lib/api-client";

export type ContextoInseminacao = {
  temPendente: boolean;
  proximaTentativa: number;
};

export type InseminacaoCriada = {
  id: string;
  matriz_id: string;
  numero_tentativa: number;
  status: "pendente";
  data_diagnostico_prevista: string;
};

export async function contextoMatrizInseminacaoApi(
  matrizId: string,
): Promise<ContextoInseminacao> {
  const response = await apiFetch(
    `/api/matrizes/${encodeURIComponent(matrizId)}/contexto-inseminacao`,
  );
  if (!response.ok) {
    throw new Error("Não foi possível carregar o contexto da matriz.");
  }
  return (await response.json()) as ContextoInseminacao;
}

export async function ultimoInseminadorIdApi(): Promise<string | null> {
  const response = await apiFetch("/api/inseminacoes/ultimo-inseminador");
  if (!response.ok) return null;
  const body = (await response.json()) as { inseminador_id: string | null };
  return body.inseminador_id;
}

export async function criarInseminacaoApi(dados: {
  matriz_id: string;
  reprodutor_id: string;
  inseminador_id: string;
  lote_id?: string | null;
  data: string;
  tipo: string;
  observacoes?: string;
}): Promise<InseminacaoCriada> {
  const response = await apiFetch("/api/inseminacoes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  const body = (await response.json()) as {
    inseminacao: InseminacaoCriada;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(body.error ?? "Não foi possível salvar.");
  }
  return body.inseminacao;
}