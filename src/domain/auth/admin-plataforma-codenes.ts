import type { Session } from "../../lib/auth-types";

const EMAIL_ADMIN_PLATAFORMA = "admin@codenes.com.br";

/** Admin geral Codenes no seed — único com atalhos administrativos no app mobile. */
export function ehEmailAdminPlataformaCodenes(
  sessao: Session | null | undefined,
): boolean {
  return sessao?.identificador.trim().toLowerCase() === EMAIL_ADMIN_PLATAFORMA;
}

export function ehAdminPlataformaCodenes(sessao: Session | null | undefined): boolean {
  if (!sessao?.plataformaAdmin) {
    return false;
  }
  return ehEmailAdminPlataformaCodenes(sessao);
}

/** Atalho no app (Mais / desktop) para a tela unificada de cadastros. */
export function mostrarAtalhoCadastrosPlataformaNoApp(
  sessao: Session | null | undefined,
): boolean {
  return Boolean(sessao?.plataformaAdmin) || ehEmailAdminPlataformaCodenes(sessao);
}