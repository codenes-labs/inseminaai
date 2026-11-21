import { emailEhAdminPlataformaCodenes } from "../../../domain/auth/admin-plataforma-codenes";
import type { Papel } from "../../../lib/auth-types";

export type ModoEntrada = "app" | "plataforma";

export type SessaoDestinoInput = {
  identificador: string;
  papel: Papel;
};

export function resolverDestinoPosLogin(
  sessao: SessaoDestinoInput,
  modo: ModoEntrada,
  opcoes?: { modoAppPlataforma?: boolean },
): string {
  const emModoApp = opcoes?.modoAppPlataforma === true;
  const adminPlataforma = emailEhAdminPlataformaCodenes(sessao.identificador);
  if (modo === "plataforma") {
    return adminPlataforma ? "/admin/cadastros" : "/entrar";
  }
  if (adminPlataforma && !emModoApp) {
    return "/admin/cadastros";
  }
  return "/inicio";
}

export function contaPodeEntrarModoPlataforma(identificador: string): boolean {
  return emailEhAdminPlataformaCodenes(identificador);
}