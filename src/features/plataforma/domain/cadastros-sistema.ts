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