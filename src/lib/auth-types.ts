export type Papel = "administrador" | "inseminador";

export type SessionUser = {
  email: string;
  nome: string;
  cadastroId: string;
  papel: Papel;
  demo: boolean;
  plataformaAdmin: boolean;
};

export type Session = SessionUser & {
  token: string;
  expiresAt: number;
  lastActivityAt: number;
  /** Compatível com telas que ainda usam identificador. */
  identificador: string;
};

export const STORAGE_KEY = "inseminaai.session";
export const IDLE_MS = 2 * 60 * 60 * 1000;
export const MENSAGEM_LOGIN_INVALIDO =
  "Não foi possível entrar. Confira os dados e tente de novo.";