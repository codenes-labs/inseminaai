export type Papel = "administrador" | "inseminador";

export type AuthUser = {
  id: string;
  email: string;
  nome: string;
  cadastroId: string;
  papel: Papel;
  demo: boolean;
  plataformaAdmin: boolean;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  nome: string;
  cadastro_id: string;
  papel: Papel;
  demo: boolean;
  iat: number;
  exp: number;
};

export const JWT_TTL_SECONDS = 12 * 60 * 60;

export const MENSAGEM_CREDENCIAIS_INVALIDAS =
  "Não foi possível entrar. Confira os dados e tente de novo.";