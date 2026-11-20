import type { Papel } from "../../../lib/auth-types";
import { senhaNovaValida } from "./gerar-senha";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CriarMembroCadastroInput = {
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
};

export function validarCriarMembroCadastro(
  input: CriarMembroCadastroInput,
): string | null {
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  if (nome.length < 2) {
    return "Informe o nome do usuário.";
  }
  if (!email || !EMAIL_RE.test(email)) {
    return "Informe um e-mail válido.";
  }
  if (!senhaNovaValida(input.senha)) {
    return "A senha inicial deve ter pelo menos 8 caracteres.";
  }
  if (input.papel !== "administrador" && input.papel !== "inseminador") {
    return "Selecione o papel do usuário.";
  }
  return null;
}