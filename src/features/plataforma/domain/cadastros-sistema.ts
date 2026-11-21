/** IDs fixos do seed dev — não podem ser excluídos (SPEC-21 / README). */
export const CADASTRO_ADMIN_ID = "00000000-0000-4000-8000-000000000001";
export const CADASTRO_DEMO_ID = "00000000-0000-4000-8000-000000000002";

export const USER_ADMIN_ID = "00000000-0000-4000-9000-000000000001";
export const USER_DEMO_ID = "00000000-0000-4000-9000-000000000002";

export function cadastroProtegidoSistema(cadastroId: string): boolean {
  return cadastroId === CADASTRO_ADMIN_ID || cadastroId === CADASTRO_DEMO_ID;
}

export function usuarioProtegidoSistema(userId: string): boolean {
  return userId === USER_ADMIN_ID || userId === USER_DEMO_ID;
}

/** Seed administrador: não inativa nem exclui. */
export function cadastroBloqueiaInativacao(cadastroId: string): boolean {
  return cadastroId === CADASTRO_ADMIN_ID;
}

/** Seed admin e demo: não exclui (demo pode inativar). */
export function cadastroBloqueiaExclusao(cadastroId: string): boolean {
  return cadastroProtegidoSistema(cadastroId);
}

export function mensagemBloqueioInativacao(cadastroId: string): string {
  if (cadastroId === CADASTRO_ADMIN_ID) {
    return "O cadastro administrador do sistema não pode ser inativado.";
  }
  return "Este cadastro não pode ser inativado.";
}

export function mensagemBloqueioExclusao(cadastroId: string): string {
  if (cadastroId === CADASTRO_ADMIN_ID) {
    return "O cadastro administrador do sistema não pode ser excluído.";
  }
  if (cadastroId === CADASTRO_DEMO_ID) {
    return "O cadastro demo do sistema não pode ser excluído.";
  }
  return "Este cadastro é do sistema e não pode ser excluído.";
}