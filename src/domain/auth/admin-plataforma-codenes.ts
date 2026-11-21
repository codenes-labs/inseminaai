import type { Session } from "../../lib/auth-types";

export const EMAIL_ADMIN_PLATAFORMA = "admin@codenes.com.br";

export function emailEhAdminPlataformaCodenes(
  email: string | null | undefined,
): boolean {
  return email?.trim().toLowerCase() === EMAIL_ADMIN_PLATAFORMA;
}

/** Única conta com painel administrativo da plataforma (web e app). */
export function ehAdminPlataformaCodenes(
  sessao: Session | null | undefined,
): boolean {
  if (!sessao) {
    return false;
  }
  return emailEhAdminPlataformaCodenes(sessao.identificador ?? sessao.email);
}

/** Atalho no app (Mais / desktop) — some por completo para demais logins. */
export function mostrarAtalhoCadastrosPlataformaNoApp(
  sessao: Session | null | undefined,
): boolean {
  return ehAdminPlataformaCodenes(sessao);
}