import { cadastroProtegidoSistema } from "../../features/plataforma/domain/cadastros-sistema";
import type { ProvisionarCadastroAutonomoInput } from "../../features/plataforma/domain/provisionar-cadastro-autonomo";
import { semContextoPlataforma } from "../db/context";
import { hashSenha } from "../db/password";

export type CadastroPlataformaLista = {
  id: string;
  nome: string;
  tipo: string;
  plano: string;
  ativa: boolean;
  createdAt: string;
};

export async function obterCadastroPlataforma(
  databaseUrl: string,
  cadastroId: string,
): Promise<CadastroPlataformaLista | null> {
  return semContextoPlataforma(databaseUrl, async (cliente) => {
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
       where id = $1`,
      [cadastroId],
    );
    const linha = resultado.rows[0];
    if (!linha) {
      return null;
    }
    return {
      id: linha.id,
      nome: linha.nome,
      tipo: linha.tipo,
      plano: linha.plano,
      ativa: linha.ativa,
      createdAt: linha.created_at.toISOString(),
    };
  });
}

export type AtualizarCadastroPlataformaInput = {
  nome: string;
  tipo: "autonomo" | "empresa";
  ativa: boolean;
};

export async function atualizarCadastroPlataforma(
  databaseUrl: string,
  cadastroId: string,
  input: AtualizarCadastroPlataformaInput,
): Promise<boolean> {
  const nome = input.nome.trim();
  if (nome.length < 2) {
    throw new Error("Informe o nome do cadastro.");
  }
  return semContextoPlataforma(databaseUrl, async (cliente) => {
    const resultado = await cliente.query(
      `update public.cadastros
       set nome = $2, tipo = $3, ativa = $4
       where id = $1`,
      [cadastroId, nome, input.tipo, input.ativa],
    );
    return (resultado.rowCount ?? 0) > 0;
  });
}

export async function listarCadastrosPlataforma(
  databaseUrl: string,
): Promise<CadastroPlataformaLista[]> {
  return semContextoPlataforma(databaseUrl, async (cliente) => {
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

export async function excluirCadastroPlataforma(
  databaseUrl: string,
  cadastroId: string,
): Promise<void> {
  if (cadastroProtegidoSistema(cadastroId)) {
    throw new Error("Este cadastro é do sistema e não pode ser excluído.");
  }
  return semContextoPlataforma(databaseUrl, async (cliente) => {
    const resultado = await cliente.query(
      `delete from public.cadastros where id = $1`,
      [cadastroId],
    );
    if ((resultado.rowCount ?? 0) === 0) {
      throw new Error("Cadastro não encontrado.");
    }
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

  try {
    return await semContextoPlataforma(databaseUrl, async (cliente) => {
      const cadastro = await cliente.query<{ id: string }>(
        `insert into public.cadastros (nome, tipo, plano, ativa)
         values ($1, $2, 'gratuito', true)
         returning id`,
        [nomeCadastro, input.tipo ?? "autonomo"],
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

      return { cadastroId, userId };
    });
  } catch (erro: unknown) {
    const pg = erro as { code?: string };
    if (pg.code === "23505") {
      throw new Error("Não foi possível criar o acesso. Verifique se o e-mail já está em uso.");
    }
    throw erro;
  }
}