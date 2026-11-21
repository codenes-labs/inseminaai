import {
  cadastroBloqueiaExclusao,
  cadastroBloqueiaInativacao,
  mensagemBloqueioExclusao,
  mensagemBloqueioInativacao,
} from "../../features/plataforma/domain/cadastros-sistema";
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
  emailLogin: string;
  emailsBusca: string;
};

type LinhaCadastroPlataformaDb = {
  id: string;
  nome: string;
  tipo: string;
  plano: string;
  ativa: boolean;
  created_at: Date | string;
  email_login: string | null;
  emails_busca: string | null;
};

function instantePostgresParaIso(valor: Date | string): string {
  if (valor instanceof Date) {
    return valor.toISOString();
  }
  const parseado = new Date(valor);
  if (!Number.isNaN(parseado.getTime())) {
    return parseado.toISOString();
  }
  return String(valor);
}

function mapLinhaCadastroPlataforma(
  linha: LinhaCadastroPlataformaDb,
): CadastroPlataformaLista {
  return {
    id: linha.id,
    nome: linha.nome,
    tipo: linha.tipo,
    plano: linha.plano,
    ativa: linha.ativa,
    createdAt: instantePostgresParaIso(linha.created_at),
    emailLogin: linha.email_login ?? "",
    emailsBusca: linha.emails_busca ?? "",
  };
}

const SQL_SELECT_CADASTROS_PLATAFORMA = `select c.id, c.nome, c.tipo, c.plano, c.ativa, c.created_at,
              (
                select u.email
                from public.membros_cadastro m
                join public.users u on u.id = m.user_id
                where m.cadastro_id = c.id
                order by (m.papel = 'administrador') desc, u.email
                limit 1
              ) as email_login,
              (
                select string_agg(u.email, ' ' order by u.email)
                from public.membros_cadastro m
                join public.users u on u.id = m.user_id
                where m.cadastro_id = c.id
              ) as emails_busca
       from public.cadastros c`;

export async function obterCadastroPlataforma(
  databaseUrl: string,
  cadastroId: string,
): Promise<CadastroPlataformaLista | null> {
  return semContextoPlataforma(databaseUrl, async (cliente) => {
    const resultado = await cliente.query<LinhaCadastroPlataformaDb>(
      `${SQL_SELECT_CADASTROS_PLATAFORMA}
       where c.id = $1`,
      [cadastroId],
    );
    const linha = resultado.rows[0];
    if (!linha) {
      return null;
    }
    return mapLinhaCadastroPlataforma(linha);
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
  if (cadastroBloqueiaInativacao(cadastroId) && !input.ativa) {
    throw new Error(mensagemBloqueioInativacao(cadastroId));
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
    const resultado = await cliente.query<LinhaCadastroPlataformaDb>(
      SQL_SELECT_CADASTROS_PLATAFORMA,
    );
    return resultado.rows.map(mapLinhaCadastroPlataforma);
  });
}

export async function excluirCadastroPlataforma(
  databaseUrl: string,
  cadastroId: string,
): Promise<void> {
  if (cadastroBloqueiaExclusao(cadastroId)) {
    throw new Error(mensagemBloqueioExclusao(cadastroId));
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
  const hash = hashSenha(input.senha.trim());

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