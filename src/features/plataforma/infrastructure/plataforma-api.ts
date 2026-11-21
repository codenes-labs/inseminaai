import type { Papel } from "../../../lib/auth-types";
import type { MembroCadastro } from "../../conta/infrastructure/cadastro-membros-api";
import { apiFetch } from "../../../lib/api-client";

export type CadastroPlataforma = {
  id: string;
  nome: string;
  tipo: string;
  plano: string;
  ativa: boolean;
  createdAt: string;
  protegido?: boolean;
  emailLogin?: string;
  emailsBusca?: string;
};

export async function listarCadastrosPlataformaApi(): Promise<CadastroPlataforma[]> {
  const response = await apiFetch("/api/plataforma/cadastros");
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível carregar os cadastros.");
  }
  const dados = (await response.json()) as { cadastros: CadastroPlataforma[] };
  return dados.cadastros;
}

export async function obterCadastroPlataformaApi(
  cadastroId: string,
): Promise<CadastroPlataforma> {
  const response = await apiFetch(`/api/plataforma/cadastros/${cadastroId}`);
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível carregar o cadastro.");
  }
  const dados = (await response.json()) as { cadastro: CadastroPlataforma };
  return dados.cadastro;
}

export async function atualizarCadastroPlataformaApi(
  cadastroId: string,
  input: { nome: string; tipo: "autonomo" | "empresa"; ativa: boolean },
): Promise<void> {
  const response = await apiFetch(`/api/plataforma/cadastros/${cadastroId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível salvar o cliente.");
  }
}

export async function listarMembrosPlataformaCadastroApi(
  cadastroId: string,
): Promise<MembroCadastro[]> {
  const response = await apiFetch(`/api/plataforma/cadastros/${cadastroId}/membros`);
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível carregar os acessos.");
  }
  const dados = (await response.json()) as {
    membros: MembroCadastro[];
  };
  return dados.membros;
}

export async function criarMembroPlataformaCadastroApi(
  cadastroId: string,
  input: { nome: string; email: string; senha: string; papel: Papel },
): Promise<void> {
  const response = await apiFetch(`/api/plataforma/cadastros/${cadastroId}/membros`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível criar o acesso.");
  }
}

export async function atualizarMembroPlataformaCadastroApi(
  cadastroId: string,
  userId: string,
  input: {
    nome?: string;
    email?: string;
    papel?: Papel;
    ativo?: boolean;
    senha?: string;
  },
): Promise<void> {
  const response = await apiFetch(
    `/api/plataforma/cadastros/${cadastroId}/membros/${userId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível atualizar o acesso.");
  }
}

export async function excluirMembroPlataformaCadastroApi(
  cadastroId: string,
  userId: string,
): Promise<void> {
  const response = await apiFetch(
    `/api/plataforma/cadastros/${cadastroId}/membros/${userId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível excluir o acesso.");
  }
}

export async function excluirCadastroPlataformaApi(cadastroId: string): Promise<void> {
  const response = await apiFetch(`/api/plataforma/cadastros/${cadastroId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível excluir o cliente.");
  }
}

export async function alterarMembroPlataformaAtivoApi(
  cadastroId: string,
  userId: string,
  ativo: boolean,
): Promise<void> {
  await atualizarMembroPlataformaCadastroApi(cadastroId, userId, { ativo });
}

export async function criarCadastroPlataformaApi(input: {
  nomeCadastro: string;
  nomeUsuario: string;
  email: string;
  senha: string;
  tipo: "autonomo" | "empresa";
}): Promise<{ cadastroId: string }> {
  const response = await apiFetch("/api/plataforma/cadastros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome_cadastro: input.nomeCadastro,
      nome_usuario: input.nomeUsuario,
      email: input.email,
      senha: input.senha,
      tipo: input.tipo,
    }),
  });
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível criar o cadastro.");
  }
  const dados = (await response.json()) as { cadastroId?: string };
  if (!dados.cadastroId) {
    throw new Error("Cadastro criado sem identificador.");
  }
  return { cadastroId: dados.cadastroId };
}