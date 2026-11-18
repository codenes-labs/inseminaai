import { apiFetch } from "../../../lib/api-client";

export type Reprodutor = {
  id: string;
  nome: string;
  raca: string | null;
  codigo_semen: string | null;
  ativo: boolean;
};

export type Inseminador = {
  id: string;
  nome: string;
  ativo: boolean;
};

export type Lote = {
  id: string;
  nome: string;
  data_inicio: string;
  observacoes: string | null;
  ativo: boolean;
};

export type TipoCadastro = "reprodutores" | "inseminadores" | "lotes";

function urlTipo(tipo: TipoCadastro, somenteAtivos?: boolean): string {
  const base = `/api/${tipo}`;
  if (somenteAtivos) {
    return `${base}?somente_ativos=true`;
  }
  return base;
}

export async function listarReprodutoresApi(somenteAtivos = false): Promise<Reprodutor[]> {
  const response = await apiFetch(urlTipo("reprodutores", somenteAtivos));
  if (!response.ok) throw new Error("Falha ao listar reprodutores.");
  const body = (await response.json()) as { reprodutores: Reprodutor[] };
  return body.reprodutores;
}

export async function listarInseminadoresApi(somenteAtivos = false): Promise<Inseminador[]> {
  const response = await apiFetch(urlTipo("inseminadores", somenteAtivos));
  if (!response.ok) throw new Error("Falha ao listar inseminadores.");
  const body = (await response.json()) as { inseminadores: Inseminador[] };
  return body.inseminadores;
}

export async function listarLotesApi(somenteAtivos = false): Promise<Lote[]> {
  const response = await apiFetch(urlTipo("lotes", somenteAtivos));
  if (!response.ok) throw new Error("Falha ao listar lotes.");
  const body = (await response.json()) as { lotes: Lote[] };
  return body.lotes;
}

export async function criarReprodutorApi(dados: {
  nome: string;
  raca?: string;
  codigo_semen?: string;
}): Promise<Reprodutor> {
  const response = await apiFetch("/api/reprodutores", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  const body = (await response.json()) as { reprodutor: Reprodutor; error?: string };
  if (!response.ok) throw new Error(body.error ?? "Falha ao salvar.");
  return body.reprodutor;
}

export async function atualizarReprodutorApi(
  id: string,
  dados: Partial<{ nome: string; raca: string | null; codigo_semen: string | null; ativo: boolean }>,
): Promise<Reprodutor> {
  const response = await apiFetch(`/api/reprodutores/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
  const body = (await response.json()) as { reprodutor: Reprodutor; error?: string };
  if (!response.ok) throw new Error(body.error ?? "Falha ao salvar.");
  return body.reprodutor;
}

export async function criarInseminadorApi(dados: { nome: string }): Promise<Inseminador> {
  const response = await apiFetch("/api/inseminadores", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  const body = (await response.json()) as { inseminador: Inseminador; error?: string };
  if (!response.ok) throw new Error(body.error ?? "Falha ao salvar.");
  return body.inseminador;
}

export async function atualizarInseminadorApi(
  id: string,
  dados: Partial<{ nome: string; ativo: boolean }>,
): Promise<Inseminador> {
  const response = await apiFetch(`/api/inseminadores/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
  const body = (await response.json()) as { inseminador: Inseminador; error?: string };
  if (!response.ok) throw new Error(body.error ?? "Falha ao salvar.");
  return body.inseminador;
}

export async function criarLoteApi(dados: {
  nome: string;
  data_inicio: string;
  observacoes?: string;
}): Promise<Lote> {
  const response = await apiFetch("/api/lotes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  const body = (await response.json()) as { lote: Lote; error?: string };
  if (!response.ok) throw new Error(body.error ?? "Falha ao salvar.");
  return body.lote;
}

export async function atualizarLoteApi(
  id: string,
  dados: Partial<{
    nome: string;
    data_inicio: string;
    observacoes: string | null;
    ativo: boolean;
  }>,
): Promise<Lote> {
  const response = await apiFetch(`/api/lotes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
  const body = (await response.json()) as { lote: Lote; error?: string };
  if (!response.ok) throw new Error(body.error ?? "Falha ao salvar.");
  return body.lote;
}