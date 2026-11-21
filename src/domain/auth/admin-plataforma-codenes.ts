import type { Session } from "../../lib/auth-types";

const EMAIL_ADMIN_PLATAFORMA = "admin@codenes.com.br";

/** Admin geral Codenes no seed — único com atalhos administrativos no app mobile. */
export function ehAdminPlataformaCodenes(sessao: Session | null | undefined): boolean {
  if (!sessao?.plataformaAdmin) {
    return false;
  }
  return sessao.identificador.trim().toLowerCase() === EMAIL_ADMIN_PLATAFORMA;
}