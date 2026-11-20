import type { AuthUser, Papel } from "./types";

type SeedAccount = AuthUser & { password: string };

/** IDs fixos alinhados ao seed Postgres (`src/server/db/seed.ts`). Fallback sem DATABASE_URL. */
export const CADASTRO_ADMIN_ID = "00000000-0000-4000-8000-000000000001";
export const CADASTRO_DEMO_ID = "00000000-0000-4000-8000-000000000002";

const CONTAS: SeedAccount[] = [
  {
    id: "00000000-0000-4000-9000-000000000001",
    email: "admin@codenes.com.br",
    password: "CodenesTemp1",
    nome: "Vitor Almeida",
    cadastroId: CADASTRO_ADMIN_ID,
    papel: "administrador",
    demo: false,
  },
  {
    id: "00000000-0000-4000-9000-000000000002",
    email: "teste@teste.com",
    password: "teste",
    nome: "Conta demo",
    cadastroId: CADASTRO_DEMO_ID,
    papel: "inseminador",
    demo: true,
  },
];

function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

export function autenticarSeed(
  email: string,
  password: string,
): AuthUser | null {
  const alvo = normalizarEmail(email);
  const conta = CONTAS.find((c) => normalizarEmail(c.email) === alvo);
  if (!conta || conta.password !== password) {
    return null;
  }
  const { password: _senha, ...usuario } = conta;
  return usuario;
}

export function usuarioPorId(id: string): AuthUser | null {
  const conta = CONTAS.find((c) => c.id === id);
  if (!conta) return null;
  const { password: _senha, ...usuario } = conta;
  return usuario;
}

export function papelValido(valor: unknown): valor is Papel {
  return valor === "administrador" || valor === "inseminador";
}