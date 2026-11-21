import { senhaNovaValida } from "../../conta/domain/gerar-senha";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type TipoCadastroPlataforma = "autonomo" | "empresa";

export type ProvisionarCadastroAutonomoInput = {
  nomeCadastro: string;
  nomeUsuario: string;
  email: string;
  senha: string;
  tipo?: TipoCadastroPlataforma;
};

export function validarProvisionarCadastroAutonomo(
  input: ProvisionarCadastroAutonomoInput,
): string | null {
  const nomeCadastro = input.nomeCadastro.trim();
  const nomeUsuario = input.nomeUsuario.trim();
  const email = input.email.trim().toLowerCase();
  const tipo = input.tipo ?? "autonomo";
  if (tipo !== "autonomo" && tipo !== "empresa") {
    return "Tipo de cadastro inválido.";
  }
  if (nomeCadastro.length < 2) {
    return "Informe o nome do cadastro.";
  }
  if (nomeUsuario.length < 2) {
    return "Informe o nome do usuário.";
  }
  if (!email || !EMAIL_RE.test(email)) {
    return "Informe um e-mail válido.";
  }
  if (!senhaNovaValida(input.senha)) {
    return "A senha inicial deve ter pelo menos 8 caracteres.";
  }
  return null;
}