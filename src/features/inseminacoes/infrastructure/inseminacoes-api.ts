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

export type InseminacaoPendente = {
  id: string;
  matriz_id: string;
  data: string;
  numero_tentativa: number;
  tipo: string;
};

export type DiagnosticoRegistrado = {
  id: string;
  matriz_id: string;
  status: "prenhe" | "vazia";
  data_diagnostico: string;
  previsao_parto: string | null;
};

export async function inseminacaoPendenteDaMatrizApi(
  matrizId: string,
): Promise<InseminacaoPendente | null> {
  const response = await apiFetch(
    `/api/matrizes/${encodeURIComponent(matrizId)}/inseminacao-pendente`,
  );
  if (!response.ok) {
    throw new Error("Não foi possível carregar a inseminação pendente.");
  }
  const body = (await response.json()) as {
    inseminacao: InseminacaoPendente | null;
  };
  return body.inseminacao;
}

export async function registrarDiagnosticoApi(
  inseminacaoId: string,
  dados: {
    resultado: "prenhe" | "vazia";
    data_diagnostico: string;
    observacoes?: string;
  },
): Promise<DiagnosticoRegistrado> {
  const response = await apiFetch(
    `/api/inseminacoes/${encodeURIComponent(inseminacaoId)}/diagnostico`,
    {
      method: "PATCH",
      body: JSON.stringify(dados),
    },
  );
  const body = (await response.json()) as {
    diagnostico: DiagnosticoRegistrado;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(body.error ?? "Não foi possível salvar o diagnóstico.");
  }
  return body.diagnostico;
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