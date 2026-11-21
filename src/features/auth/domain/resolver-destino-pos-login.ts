import type { Papel } from "../../../lib/auth-types";

export type ModoEntrada = "app" | "plataforma";

export type SessaoDestinoInput = {
  plataformaAdmin: boolean;
  papel: Papel;
};

export function resolverDestinoPosLogin(
  sessao: SessaoDestinoInput,
  modo: ModoEntrada,
): string {
  if (modo === "plataforma") {
    return sessao.plataformaAdmin ? "/admin/cadastros" : "/entrar";
  }
  if (sessao.plataformaAdmin) {
    return "/admin/cadastros";
  }
  return "/inicio";
}

export function contaPodeEntrarModoPlataforma(plataformaAdmin: boolean): boolean {
  return plataformaAdmin;
}