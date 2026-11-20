import { apiFetch } from "../../../lib/api-client";

export type CadastroPlataforma = {
  id: string;
  nome: string;
  tipo: string;
  plano: string;
  ativa: boolean;
  createdAt: string;
};

export async function listarCadastrosPlataformaApi(): Promise<CadastroPlataforma[]> {
  const response = await apiFetch("/api/plataforma/cadastros");
  if (!response.ok) {
    throw new Error("Não foi possível carregar os cadastros.");
  }
  const dados = (await response.json()) as { cadastros: CadastroPlataforma[] };
  return dados.cadastros;
}

export async function criarCadastroAutonomoApi(input: {
  nomeCadastro: string;
  nomeUsuario: string;
  email: string;
  senha: string;
}): Promise<void> {
  const response = await apiFetch("/api/plataforma/cadastros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome_cadastro: input.nomeCadastro,
      nome_usuario: input.nomeUsuario,
      email: input.email,
      senha: input.senha,
    }),
  });
  if (!response.ok) {
    const dados = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(dados.error ?? "Não foi possível criar o cadastro.");
  }
}