import type { Papel } from "../auth/types";
import { semContextoRls } from "../db/context";
import { hashSenha, senhaConfere } from "../db/password";

export type UsuarioAutenticado = {
  id: string;
  email: string;
  nome: string;
  cadastroId: string;
  papel: Papel;
  demo: boolean;
  plataformaAdmin: boolean;
};

export async function autenticarNoBanco(
  databaseUrl: string,
  email: string,
  senha: string,
): Promise<UsuarioAutenticado | null> {
  const alvo = email.trim().toLowerCase();
  const senhaLimpa = senha.trim();
  return semContextoRls(databaseUrl, async (cliente) => {
    const usuario = await cliente.query<{
      id: string;
      email: string;
      password_hash: string;
      nome: string;
      demo: boolean;
      plataforma_admin: boolean;
      ativo: boolean;
    }>(
      `select id, email, password_hash, nome, demo, plataforma_admin, ativo
       from public.users
       where lower(email) = $1
       limit 1`,
      [alvo],
    );
    const linhaUsuario = usuario.rows[0];
    if (!linhaUsuario) {
      console.error("[auth] e-mail não cadastrado", { email: alvo });
      return null;
    }
    if (!linhaUsuario.ativo) {
      console.error("[auth] usuário inativo", { userId: linhaUsuario.id });
      return null;
    }
    if (!senhaConfere(senhaLimpa, linhaUsuario.password_hash)) {
      console.error("[auth] senha incorreta", { userId: linhaUsuario.id });
      return null;
    }
    const membro = await cliente.query<{
      cadastro_id: string;
      papel: string;
      cadastro_ativa: boolean;
    }>(
      `select m.cadastro_id, m.papel, c.ativa as cadastro_ativa
       from public.membros_cadastro m
       inner join public.cadastros c on c.id = m.cadastro_id
       where m.user_id = $1
       limit 1`,
      [linhaUsuario.id],
    );
    const linhaMembro = membro.rows[0];
    if (!linhaMembro) {
      console.error("[auth] usuário sem cadastro vinculado", {
        userId: linhaUsuario.id,
      });
      return null;
    }
    if (!linhaMembro.cadastro_ativa) {
      console.error("[auth] cadastro inativo", {
        userId: linhaUsuario.id,
        cadastroId: linhaMembro.cadastro_id,
      });
      return null;
    }
    if (
      linhaMembro.papel !== "administrador" &&
      linhaMembro.papel !== "inseminador"
    ) {
      console.error("[auth] papel inválido", {
        userId: linhaUsuario.id,
        papel: linhaMembro.papel,
      });
      return null;
    }
    return {
      id: linhaUsuario.id,
      email: linhaUsuario.email,
      nome: linhaUsuario.nome,
      cadastroId: linhaMembro.cadastro_id,
      papel: linhaMembro.papel as Papel,
      demo: linhaUsuario.demo,
      plataformaAdmin: linhaUsuario.plataforma_admin,
    };
  });
}

export async function senhaAtualConfereNoBanco(
  databaseUrl: string,
  userId: string,
  senha: string,
): Promise<boolean> {
  return semContextoRls(databaseUrl, async (cliente) => {
    const resultado = await cliente.query<{ password_hash: string }>(
      `select password_hash from public.users where id = $1`,
      [userId],
    );
    const linha = resultado.rows[0];
    if (!linha) return false;
    return senhaConfere(senha, linha.password_hash);
  });
}

export async function atualizarSenhaNoBanco(
  databaseUrl: string,
  userId: string,
  senhaNova: string,
): Promise<boolean> {
  const hash = hashSenha(senhaNova);
  return semContextoRls(databaseUrl, async (cliente) => {
    const resultado = await cliente.query(
      `update public.users set password_hash = $2 where id = $1`,
      [userId, hash],
    );
    return (resultado.rowCount ?? 0) > 0;
  });
}

export async function usuarioPorIdNoBanco(
  databaseUrl: string,
  userId: string,
): Promise<UsuarioAutenticado | null> {
  return semContextoRls(databaseUrl, async (cliente) => {
    const usuario = await cliente.query<{
      id: string;
      email: string;
      nome: string;
      demo: boolean;
      plataforma_admin: boolean;
      ativo: boolean;
    }>(
      `select id, email, nome, demo, plataforma_admin, ativo
       from public.users
       where id = $1
       limit 1`,
      [userId],
    );
    const linhaUsuario = usuario.rows[0];
    if (!linhaUsuario?.ativo) {
      return null;
    }
    const membro = await cliente.query<{
      cadastro_id: string;
      papel: string;
      cadastro_ativa: boolean;
    }>(
      `select m.cadastro_id, m.papel, c.ativa as cadastro_ativa
       from public.membros_cadastro m
       inner join public.cadastros c on c.id = m.cadastro_id
       where m.user_id = $1
       limit 1`,
      [userId],
    );
    const linhaMembro = membro.rows[0];
    if (!linhaMembro?.cadastro_ativa) {
      return null;
    }
    if (
      linhaMembro.papel !== "administrador" &&
      linhaMembro.papel !== "inseminador"
    ) {
      return null;
    }
    return {
      id: linhaUsuario.id,
      email: linhaUsuario.email,
      nome: linhaUsuario.nome,
      cadastroId: linhaMembro.cadastro_id,
      papel: linhaMembro.papel as Papel,
      demo: linhaUsuario.demo,
      plataformaAdmin: linhaUsuario.plataforma_admin,
    };
  });
}