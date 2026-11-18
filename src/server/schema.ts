/**
 * Espelho tipado do schema Postgres (SPEC-14). Fonte: `.docker/db/migrations/`.
 */

export const PapeisMvp = ["administrador", "inseminador"] as const;
export type PapelMvp = (typeof PapeisMvp)[number];

export const PlanosCadastro = ["gratuito", "básico", "pro"] as const;

export const TiposInseminacao = ["CN", "IATF", "PROTOCOLO"] as const;
export const StatusInseminacao = ["pendente", "prenhe", "vazia"] as const;

export type UsersRow = {
  id: string;
  email: string;
  password_hash: string;
  nome: string;
  demo: boolean;
  created_at: Date;
};

export type CadastrosRow = {
  id: string;
  nome: string;
  plano: string;
  ativa: boolean;
  created_at: Date;
};

export type MembrosCadastroRow = {
  id: string;
  cadastro_id: string;
  user_id: string;
  papel: PapelMvp;
};

export type MatrizesRow = {
  id: string;
  cadastro_id: string;
  nome: string;
  brinco: string | null;
  raca: string | null;
  data_nascimento: string | null;
  ativa: boolean;
  observacoes: string | null;
  created_at: Date;
};

/** Chave de sessão usada no `SET LOCAL` dentro da transação. */
export const APP_CADASTRO_SETTING = "app.cadastro_id";