import type { Papel } from "../auth/types";
import { semContextoRls } from "../db/context";
import { senhaConfere } from "../db/password";

export type UsuarioAutenticado = {
  id: string;
  email: string;
  nome: string;
  cadastroId: string;
  papel: Papel;
  demo: boolean;
};

type LinhaLogin = {
  id: string;
  email: string;
  password_hash: string;
  nome: string;
  demo: boolean;
  cadastro_id: string;
  papel: string;
};

export async function autenticarNoBanco(
  databaseUrl: string,
  email: string,
  senha: string,
): Promise<UsuarioAutenticado | null> {
  const alvo = email.trim().toLowerCase();
  return semContextoRls(databaseUrl, async (cliente) => {
    const resultado = await cliente.query<LinhaLogin>(
      `select u.id, u.email, u.password_hash, u.nome, u.demo,
              m.cadastro_id, m.papel
       from public.users u
       inner join public.membros_cadastro m on m.user_id = u.id
       where lower(u.email) = $1
       limit 1`,
      [alvo],
    );
    const linha = resultado.rows[0];
    if (!linha || !senhaConfere(senha, linha.password_hash)) {
      return null;
    }
    if (linha.papel !== "administrador" && linha.papel !== "inseminador") {
      return null;
    }
    return {
      id: linha.id,
      email: linha.email,
      nome: linha.nome,
      cadastroId: linha.cadastro_id,
      papel: linha.papel,
      demo: linha.demo,
    };
  });
}

export async function usuarioPorIdNoBanco(
  databaseUrl: string,
  userId: string,
): Promise<UsuarioAutenticado | null> {
  return semContextoRls(databaseUrl, async (cliente) => {
    const resultado = await cliente.query<LinhaLogin>(
      `select u.id, u.email, u.password_hash, u.nome, u.demo,
              m.cadastro_id, m.papel
       from public.users u
       inner join public.membros_cadastro m on m.user_id = u.id
       where u.id = $1
       limit 1`,
      [userId],
    );
    const linha = resultado.rows[0];
    if (!linha) return null;
    if (linha.papel !== "administrador" && linha.papel !== "inseminador") {
      return null;
    }
    return {
      id: linha.id,
      email: linha.email,
      nome: linha.nome,
      cadastroId: linha.cadastro_id,
      papel: linha.papel,
      demo: linha.demo,
    };
  });
}