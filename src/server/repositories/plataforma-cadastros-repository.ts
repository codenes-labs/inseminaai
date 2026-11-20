import type { ProvisionarCadastroAutonomoInput } from "../../features/plataforma/domain/provisionar-cadastro-autonomo";
import { semContextoRls } from "../db/context";
import { hashSenha } from "../db/password";

export type CadastroPlataformaLista = {
  id: string;
  nome: string;
  tipo: string;
  plano: string;
  ativa: boolean;
  createdAt: string;
};

export async function listarCadastrosPlataforma(
  databaseUrl: string,
): Promise<CadastroPlataformaLista[]> {
  return semContextoRls(databaseUrl, async (cliente) => {
    const resultado = await cliente.query<{
      id: string;
      nome: string;
      tipo: string;
      plano: string;
      ativa: boolean;
      created_at: Date;
    }>(
      `select id, nome, tipo, plano, ativa, created_at
       from public.cadastros
       order by created_at desc`,
    );
    return resultado.rows.map((linha) => ({
      id: linha.id,
      nome: linha.nome,
      tipo: linha.tipo,
      plano: linha.plano,
      ativa: linha.ativa,
      createdAt: linha.created_at.toISOString(),
    }));
  });
}

export async function criarCadastroAutonomoNoBanco(
  databaseUrl: string,
  input: ProvisionarCadastroAutonomoInput,
): Promise<{ cadastroId: string; userId: string }> {
  const nomeCadastro = input.nomeCadastro.trim();
  const nomeUsuario = input.nomeUsuario.trim();
  const email = input.email.trim().toLowerCase();
  const hash = hashSenha(input.senha);

  return semContextoRls(databaseUrl, async (cliente) => {
    await cliente.query("BEGIN");
    try {
      const cadastro = await cliente.query<{ id: string }>(
        `insert into public.cadastros (nome, tipo, plano, ativa)
         values ($1, 'autonomo', 'gratuito', true)
         returning id`,
        [nomeCadastro],
      );
      const cadastroId = cadastro.rows[0]?.id;
      if (!cadastroId) {
        throw new Error("Falha ao criar cadastro.");
      }

      const usuario = await cliente.query<{ id: string }>(
        `insert into public.users (email, password_hash, nome, demo, ativo, plataforma_admin)
         values ($1, $2, $3, false, true, false)
         returning id`,
        [email, hash, nomeUsuario],
      );
      const userId = usuario.rows[0]?.id;
      if (!userId) {
        throw new Error("Falha ao criar usuário.");
      }

      await cliente.query(
        `insert into public.membros_cadastro (cadastro_id, user_id, papel)
         values ($1, $2, 'administrador')`,
        [cadastroId, userId],
      );

      await cliente.query("COMMIT");
      return { cadastroId, userId };
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