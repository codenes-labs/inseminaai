import { apiSignIn, apiSignOut } from "./auth-api";
import { MENSAGEM_LOGIN_INVALIDO } from "./auth-types";
import {
  gravarSessaoApi,
  lerSessao,
  limparSessao,
  obterCadastroId,
  sessaoValida,
  tocarSessao,
} from "./auth-session";

export type { Session } from "./auth-types";
export {
  MENSAGEM_LOGIN_INVALIDO,
  limparSessao,
  obterCadastroId,
  sessaoValida,
  tocarSessao,
};

export { lerSessao };

export function sair() {
  limparSessao();
  void apiSignOut();
}

export async function entrarComSenha(
  email: string,
  senha: string,
  turnstileToken?: string,
) {
  const resultado = await apiSignIn(email, senha, turnstileToken);
  if (!resultado.ok) {
    return { ok: false as const, erro: resultado.error };
  }
  gravarSessaoApi(
    resultado.data.token,
    resultado.data.user,
    resultado.data.expires_at,
  );
  return { ok: true as const };
}