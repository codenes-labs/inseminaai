import type { Papel } from "../auth/types";
import type { CriarMembroCadastroInput } from "../../features/conta/domain/criar-membro-cadastro";
import { senhaNovaValida } from "../../features/conta/domain/gerar-senha";
import { usuarioProtegidoSistema } from "../../features/plataforma/domain/cadastros-sistema";
import { comCadastroId, semContextoPlataforma } from "../db/context";
import { hashSenha } from "../db/password";

export type AtualizarMembroCadastroInput = {
  nome?: string;
  email?: string;
  papel?: Papel;
  ativo?: boolean;
  senha?: string;
};

export type MembroCadastroLista = {
  userId: string;
  email: string;
  nome: string;
  papel: Papel;
  ativo: boolean;
};

type ContextoMembros = { plataforma?: boolean };

function comContextoCadastro<T>(
  databaseUrl: string,
  cadastroId: string,
  opcoes: ContextoMembros | undefined,
  executar: (cliente: import("../db/context").DbCliente) => Promise<T>,
): Promise<T> {
  if (opcoes?.plataforma) {
    return semContextoPlataforma(databaseUrl, executar);
  }
  return comCadastroId(databaseUrl, cadastroId, executar);
}

export async function listarMembrosDoCadastro(
  databaseUrl: string,
  cadastroId: string,
  opcoes?: ContextoMembros,
): Promise<MembroCadastroLista[]> {
  return comContextoCadastro(databaseUrl, cadastroId, opcoes, async (cliente) => {
    const resultado = await cliente.query<{
      user_id: string;
      email: string;
      nome: string;
      papel: string;
      ativo: boolean;
    }>(
      `select m.user_id, u.email, u.nome, m.papel, u.ativo
       from public.membros_cadastro m
       inner join public.users u on u.id = m.user_id
       where m.cadastro_id = $1
       order by u.nome asc`,
      [cadastroId],
    );
    return resultado.rows
      .filter((linha) => linha.papel === "administrador" || linha.papel === "inseminador")
      .map((linha) => ({
        userId: linha.user_id,
        email: linha.email,
        nome: linha.nome,
        papel: linha.papel as Papel,
        ativo: linha.ativo,
      }));
  });
}

export async function criarMembroNoCadastro(
  databaseUrl: string,
  cadastroId: string,
  input: CriarMembroCadastroInput,
  opcoes?: ContextoMembros,
): Promise<{ userId: string }> {
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  const hash = hashSenha(input.senha);

  try {
    return await comContextoCadastro(databaseUrl, cadastroId, opcoes, async (cliente) => {
      const usuario = await cliente.query<{ id: string }>(
        `insert into public.users (email, password_hash, nome, demo, ativo, plataforma_admin)
         values ($1, $2, $3, false, true, false)
         returning id`,
        [email, hash, nome],
      );
      const userId = usuario.rows[0]?.id;
      if (!userId) {
        throw new Error("Falha ao criar usuário.");
      }
      await cliente.query(
        `insert into public.membros_cadastro (cadastro_id, user_id, papel)
         values ($1, $2, $3)`,
        [cadastroId, userId, input.papel],
      );
      return { userId };
    });
  } catch (erro: unknown) {
    const pg = erro as { code?: string };
    if (pg.code === "23505") {
      throw new Error("Não foi possível criar o acesso. Verifique se o e-mail já está em uso.");
    }
    throw erro;
  }
}

export async function atualizarMembroAtivo(
  databaseUrl: string,
  cadastroId: string,
  userIdAlvo: string,
  ativo: boolean,
  adminUserId: string,
): Promise<boolean> {
  if (userIdAlvo === adminUserId && !ativo) {
    throw new Error("Você não pode desativar o seu próprio acesso.");
  }
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const vinculo = await cliente.query<{ user_id: string }>(
      `select user_id from public.membros_cadastro
       where cadastro_id = $1 and user_id = $2`,
      [cadastroId, userIdAlvo],
    );
    if (!vinculo.rows[0]) {
      return false;
    }
    const resultado = await cliente.query(
      `update public.users set ativo = $2 where id = $1`,
      [userIdAlvo, ativo],
    );
    return (resultado.rowCount ?? 0) > 0;
  });
}

export async function atualizarMembroNoCadastro(
  databaseUrl: string,
  cadastroId: string,
  userIdAlvo: string,
  input: AtualizarMembroCadastroInput,
  opcoes?: ContextoMembros,
): Promise<boolean> {
  if (usuarioProtegidoSistema(userIdAlvo) && input.ativo === false) {
    throw new Error("Este acesso do sistema não pode ser desativado.");
  }
  const nome = input.nome?.trim();
  const email = input.email?.trim().toLowerCase();
  if (nome !== undefined && nome.length < 2) {
    throw new Error("Informe o nome do usuário.");
  }
  if (email !== undefined && !email.includes("@")) {
    throw new Error("Informe um e-mail válido.");
  }
  if (
    input.papel !== undefined &&
    input.papel !== "administrador" &&
    input.papel !== "inseminador"
  ) {
    throw new Error("Selecione o papel do usuário.");
  }
  if (input.senha !== undefined && input.senha !== "" && !senhaNovaValida(input.senha)) {
    throw new Error("A senha deve ter pelo menos 8 caracteres.");
  }

  try {
    return await comContextoCadastro(databaseUrl, cadastroId, opcoes, async (cliente) => {
      const vinculo = await cliente.query<{ user_id: string }>(
        `select user_id from public.membros_cadastro
         where cadastro_id = $1 and user_id = $2`,
        [cadastroId, userIdAlvo],
      );
      if (!vinculo.rows[0]) {
        return false;
      }

      if (nome !== undefined) {
        await cliente.query(`update public.users set nome = $2 where id = $1`, [
          userIdAlvo,
          nome,
        ]);
      }
      if (email !== undefined) {
        await cliente.query(`update public.users set email = $2 where id = $1`, [
          userIdAlvo,
          email,
        ]);
      }
      if (input.ativo !== undefined) {
        await cliente.query(`update public.users set ativo = $2 where id = $1`, [
          userIdAlvo,
          input.ativo,
        ]);
      }
      if (input.senha !== undefined && input.senha !== "") {
        await cliente.query(`update public.users set password_hash = $2 where id = $1`, [
          userIdAlvo,
          hashSenha(input.senha),
        ]);
      }
      if (input.papel !== undefined) {
        await cliente.query(
          `update public.membros_cadastro set papel = $3
           where cadastro_id = $1 and user_id = $2`,
          [cadastroId, userIdAlvo, input.papel],
        );
      }
      return true;
    });
  } catch (erro: unknown) {
    const pg = erro as { code?: string };
    if (pg.code === "23505") {
      throw new Error("Este e-mail já está em uso.");
    }
    throw erro;
  }
}

export async function excluirMembroDoCadastro(
  databaseUrl: string,
  cadastroId: string,
  userIdAlvo: string,
  opcoes?: ContextoMembros,
): Promise<boolean> {
  if (usuarioProtegidoSistema(userIdAlvo)) {
    throw new Error("Este acesso do sistema não pode ser excluído.");
  }
  return comContextoCadastro(databaseUrl, cadastroId, opcoes, async (cliente) => {
    const cadastro = await cliente.query<{ tipo: string }>(
      `select tipo from public.cadastros where id = $1`,
      [cadastroId],
    );
    if (cadastro.rows[0]?.tipo === "autonomo") {
      throw new Error(
        "Cadastro autônomo tem um único login; use excluir cliente para remover o cadastro.",
      );
    }
    const removido = await cliente.query(
      `delete from public.membros_cadastro
       where cadastro_id = $1 and user_id = $2`,
      [cadastroId, userIdAlvo],
    );
    if ((removido.rowCount ?? 0) === 0) {
      return false;
    }
    const plataforma = await cliente.query<{ plataforma_admin: boolean }>(
      `select plataforma_admin from public.users where id = $1`,
      [userIdAlvo],
    );
    if (plataforma.rows[0]?.plataforma_admin) {
      throw new Error("Não é possível excluir administrador da plataforma.");
    }
    const outros = await cliente.query<{ n: string }>(
      `select count(*)::text as n from public.membros_cadastro where user_id = $1`,
      [userIdAlvo],
    );
    if (Number(outros.rows[0]?.n ?? "0") === 0) {
      await cliente.query(`delete from public.users where id = $1`, [userIdAlvo]);
    }
    return true;
  });
}