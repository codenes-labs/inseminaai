import { randomUUID } from "node:crypto";
import { comCadastroId } from "../db/context";
import {
  brincoDuplicadoNoCadastro,
  normalizarBrinco,
  validarNomeMatriz,
} from "../../features/matrizes/domain/validacao";
import { textoBuscaCoincide } from "../../features/matrizes/domain/busca";

export type MatrizResumo = {
  id: string;
  nome: string;
  brinco: string | null;
  raca: string | null;
  ativa: boolean;
};

export type MatrizDetalhe = MatrizResumo & {
  observacoes: string | null;
};

export type CriarMatrizInput = {
  nome: string;
  brinco?: string | null;
  raca?: string | null;
  observacoes?: string | null;
};

export type AtualizarMatrizInput = Partial<CriarMatrizInput> & {
  ativa?: boolean;
};

export class ErroMatrizDomain extends Error {
  constructor(
    message: string,
    readonly codigo: "validacao" | "duplicado" | "nao_encontrada",
  ) {
    super(message);
    this.name = "ErroMatrizDomain";
  }
}

async function listarBrincos(
  databaseUrl: string,
  cadastroId: string,
  excluirId?: string,
): Promise<{ id: string; brinco: string | null }[]> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<{ id: string; brinco: string | null }>(
      `select id, brinco from public.matrizes`,
    );
    return resultado.rows.filter((r) => r.id !== excluirId);
  });
}

export async function listarMatrizesAtivas(
  databaseUrl: string,
  cadastroId: string,
  consulta?: string,
): Promise<MatrizResumo[]> {
  const linhas = await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<MatrizResumo>(
      `select id, nome, brinco, raca, ativa
       from public.matrizes
       where ativa = true
       order by nome asc`,
    );
    return resultado.rows;
  });
  const q = consulta?.trim() ?? "";
  if (!q) return linhas;
  return linhas.filter(
    (m) =>
      textoBuscaCoincide(m.nome, q) ||
      (m.brinco != null && textoBuscaCoincide(m.brinco, q)),
  );
}

/** @deprecated use listarMatrizesAtivas */
export async function listarMatrizes(
  databaseUrl: string,
  cadastroId: string,
): Promise<MatrizResumo[]> {
  return listarMatrizesAtivas(databaseUrl, cadastroId);
}

export async function obterMatriz(
  databaseUrl: string,
  cadastroId: string,
  id: string,
): Promise<MatrizDetalhe | null> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<MatrizDetalhe>(
      `select id, nome, brinco, raca, ativa, observacoes
       from public.matrizes
       where id = $1`,
      [id],
    );
    return resultado.rows[0] ?? null;
  });
}

export async function criarMatriz(
  databaseUrl: string,
  cadastroId: string,
  input: CriarMatrizInput,
): Promise<MatrizDetalhe> {
  const erroNome = validarNomeMatriz(input.nome);
  if (erroNome) throw new ErroMatrizDomain(erroNome, "validacao");
  const brinco = normalizarBrinco(input.brinco);
  const existentes = await listarBrincos(databaseUrl, cadastroId);
  if (brincoDuplicadoNoCadastro(brinco, existentes)) {
    throw new ErroMatrizDomain(
      "Este brinco já está em uso neste cadastro.",
      "duplicado",
    );
  }
  const id = randomUUID();
  const raca = input.raca?.trim() || null;
  const observacoes = input.observacoes?.trim() || null;

  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    try {
      await cliente.query(
        `insert into public.matrizes
         (id, cadastro_id, nome, brinco, raca, observacoes, ativa)
         values ($1, $2, $3, $4, $5, $6, true)`,
        [id, cadastroId, input.nome.trim(), brinco, raca, observacoes],
      );
    } catch (cause) {
      if (
        cause &&
        typeof cause === "object" &&
        "code" in cause &&
        (cause as { code: string }).code === "23505"
      ) {
        throw new ErroMatrizDomain(
          "Este brinco já está em uso neste cadastro.",
          "duplicado",
        );
      }
      throw cause;
    }
    const resultado = await cliente.query<MatrizDetalhe>(
      `select id, nome, brinco, raca, ativa, observacoes
       from public.matrizes where id = $1`,
      [id],
    );
    const criada = resultado.rows[0];
    if (!criada) {
      throw new Error("Falha ao criar matriz.");
    }
    return criada;
  });
}

export async function atualizarMatriz(
  databaseUrl: string,
  cadastroId: string,
  id: string,
  input: AtualizarMatrizInput,
): Promise<MatrizDetalhe> {
  const atual = await obterMatriz(databaseUrl, cadastroId, id);
  if (!atual) {
    throw new ErroMatrizDomain("Matriz não encontrada.", "nao_encontrada");
  }
  const nome = input.nome !== undefined ? input.nome : atual.nome;
  const erroNome = validarNomeMatriz(nome);
  if (erroNome) throw new ErroMatrizDomain(erroNome, "validacao");
  const brinco =
    input.brinco !== undefined
      ? normalizarBrinco(input.brinco)
      : atual.brinco;
  const existentes = await listarBrincos(databaseUrl, cadastroId, id);
  if (brincoDuplicadoNoCadastro(brinco, existentes, id)) {
    throw new ErroMatrizDomain(
      "Este brinco já está em uso neste cadastro.",
      "duplicado",
    );
  }
  const raca =
    input.raca !== undefined ? input.raca?.trim() || null : atual.raca;
  const observacoes =
    input.observacoes !== undefined
      ? input.observacoes?.trim() || null
      : atual.observacoes;
  const ativa = input.ativa !== undefined ? input.ativa : atual.ativa;

  await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    try {
      await cliente.query(
        `update public.matrizes
         set nome = $2, brinco = $3, raca = $4, observacoes = $5, ativa = $6
         where id = $1`,
        [id, nome.trim(), brinco, raca, observacoes, ativa],
      );
    } catch (cause) {
      if (
        cause &&
        typeof cause === "object" &&
        "code" in cause &&
        (cause as { code: string }).code === "23505"
      ) {
        throw new ErroMatrizDomain(
          "Este brinco já está em uso neste cadastro.",
          "duplicado",
        );
      }
      throw cause;
    }
  });

  const atualizada = await obterMatriz(databaseUrl, cadastroId, id);
  if (!atualizada) {
    throw new ErroMatrizDomain("Matriz não encontrada.", "nao_encontrada");
  }
  return atualizada;
}