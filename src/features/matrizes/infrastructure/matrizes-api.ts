import type { Situacao } from "../../../data/mock";
import { apiFetch } from "../../../lib/api-client";

export type MatrizLista = {
  id: string;
  nome: string;
  brinco: string;
  raca: string | null;
  observacoes: string | null;
  situacao: Situacao;
  ultimaInseminacao: string | null;
  ativa: boolean;
};

type ListaResposta = { matrizes: MatrizLista[] };
type UmaResposta = { matriz: MatrizLista };

export async function listarMatrizesApi(
  consulta?: string,
): Promise<MatrizLista[]> {
  const q = consulta?.trim();
  const url = q
    ? `/api/matrizes?q=${encodeURIComponent(q)}`
    : "/api/matrizes";
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as matrizes.");
  }
  const body = (await response.json()) as ListaResposta;
  return body.matrizes;
}

export async function obterMatrizApi(id: string): Promise<MatrizLista | null> {
  const response = await apiFetch(`/api/matrizes/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar a matriz.");
  }
  const body = (await response.json()) as UmaResposta;
  return body.matriz;
}

export async function criarMatrizApi(dados: {
  nome: string;
  brinco?: string;
  raca?: string;
  observacoes?: string;
}): Promise<MatrizLista> {
  const response = await apiFetch("/api/matrizes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  const body = (await response.json()) as UmaResposta & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Não foi possível salvar.");
  }
  return body.matriz;
}

export async function atualizarMatrizApi(
  id: string,
  dados: {
    nome?: string;
    brinco?: string | null;
    raca?: string | null;
    observacoes?: string | null;
    ativa?: boolean;
  },
): Promise<MatrizLista> {
  const response = await apiFetch(`/api/matrizes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
  const body = (await response.json()) as UmaResposta & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Não foi possível salvar.");
  }
  return body.matriz;
}