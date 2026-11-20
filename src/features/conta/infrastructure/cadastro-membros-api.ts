import type { Papel } from "../../../lib/auth-types";
import { apiFetch } from "../../../lib/api-client";

export type MembroCadastro = {
  userId: string;
  email: string;
  nome: string;
  papel: Papel;
  ativo: boolean;
};

export async function listarMembrosCadastroApi(): Promise<MembroCadastro[]> {
  const response = await apiFetch("/api/cadastro/membros");
  if (!response.ok) {
    throw new Error("Não foi possível carregar os usuários.");
  }
  const dados = (await response.json()) as {
    membros: {
      userId: string;
      email: string;
      nome: string;
      papel: Papel;
      ativo: boolean;
    }[];
  };
  return dados.membros;
}

export async function criarMembroCadastroApi(input: {
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
}): Promise<void> {
  const response = await apiFetch("/api/cadastro/membros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível criar o usuário.");
  }
}

export async function alterarMembroAtivoApi(userId: string, ativo: boolean): Promise<void> {
  const response = await apiFetch(`/api/cadastro/membros/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo }),
  });
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível atualizar o usuário.");
  }
}