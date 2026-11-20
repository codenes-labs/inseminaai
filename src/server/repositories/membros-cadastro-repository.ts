import type { Papel } from "../auth/types";
import type { CriarMembroCadastroInput } from "../../features/conta/domain/criar-membro-cadastro";
import { semContextoRls } from "../db/context";
import { hashSenha } from "../db/password";

export type MembroCadastroLista = {
  userId: string;
  email: string;
  nome: string;
  papel: Papel;
  ativo: boolean;
};

export async function listarMembrosDoCadastro(
  databaseUrl: string,
  cadastroId: string,
): Promise<MembroCadastroLista[]> {
  return semContextoRls(databaseUrl, async (cliente) => {
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
): Promise<{ userId: string }> {
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  const hash = hashSenha(input.senha);

  return semContextoRls(databaseUrl, async (cliente) => {
    await cliente.query("BEGIN");
    try {
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
      await cliente.query("COMMIT");
      return { userId };
    } catch (erro: unknown) {
      await cliente.query("ROLLBACK");
      const pg = erro as { code?: string };
      if (pg.code === "23505") {
        throw new Error("Não foi possível criar o acesso. Verifique se o e-mail já está em uso.");
      }
      throw erro;
    }
  });
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
  return semContextoRls(databaseUrl, async (cliente) => {
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