import { randomUUID } from "node:crypto";
import { comCadastroId } from "../db/context";
import {
  brincoDuplicadoNoCadastro,
  normalizarBrinco,
  validarNomeMatriz,
} from "../../features/matrizes/domain/validacao";
import type { StatusInseminacao } from "../../features/inseminacoes/domain/calculos";
import { textoBuscaCoincide } from "../../features/matrizes/domain/busca";
import {
  contarRepeticoesMatriz,
  derivarSituacaoDaUltimaInseminacao,
  formatarDataIsoParaBr,
  type SituacaoMatriz,
} from "../../features/matrizes/domain/resumo-reprodutivo";

export type MatrizResumo = {
  id: string;
  nome: string;
  brinco: string | null;
  raca: string | null;
  ativa: boolean;
};

export type MatrizResumoComSituacao = MatrizResumo & {
  situacao: SituacaoMatriz;
  ultimaInseminacao: string | null;
};

type LinhaInseminacaoResumo = {
  matriz_id: string;
  data: string;
  status: StatusInseminacao;
  numero_tentativa: number;
};

export type HistoricoInseminacaoMatriz = {
  id: string;
  data: string;
  tipo: "CN" | "IATF" | "Protocolo";
  status: StatusInseminacao;
  numeroTentativa: number;
  reprodutor: string;
  inseminador: string;
  lote: string | null;
  dataDiagnosticoPrevista: string | null;
  previsaoParto: string | null;
  observacoes: string | null;
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

function mapTipoInseminacao(tipo: string): HistoricoInseminacaoMatriz["tipo"] {
  if (tipo === "PROTOCOLO") return "Protocolo";
  if (tipo === "CN" || tipo === "IATF") return tipo;
  return "IATF";
}

async function buscarResumosInseminacao(
  databaseUrl: string,
  cadastroId: string,
): Promise<Map<string, LinhaInseminacaoResumo[]>> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<LinhaInseminacaoResumo>(
      `select matriz_id::text, data::text as data, status,
              numero_tentativa
       from public.inseminacoes`,
    );
    const porMatriz = new Map<string, LinhaInseminacaoResumo[]>();
    for (const linha of resultado.rows) {
      const atual = porMatriz.get(linha.matriz_id) ?? [];
      atual.push(linha);
      porMatriz.set(linha.matriz_id, atual);
    }
    return porMatriz;
  });
}

function enriquecerComSituacao(
  matriz: MatrizResumo,
  historico: LinhaInseminacaoResumo[] | undefined,
): MatrizResumoComSituacao {
  const resumos =
    historico?.map((h) => ({
      data: h.data,
      status: h.status,
      numeroTentativa: h.numero_tentativa,
    })) ?? [];
  const { situacao, ultimaInseminacaoIso } =
    derivarSituacaoDaUltimaInseminacao(resumos);
  return {
    ...matriz,
    situacao,
    ultimaInseminacao: ultimaInseminacaoIso
      ? formatarDataIsoParaBr(ultimaInseminacaoIso)
      : null,
  };
}

export async function listarMatrizesAtivas(
  databaseUrl: string,
  cadastroId: string,
  consulta?: string,
  somenteAtivos = true,
): Promise<MatrizResumoComSituacao[]> {
  const [linhas, inseminacoes] = await Promise.all([
    comCadastroId(databaseUrl, cadastroId, async (cliente) => {
      const resultado = await cliente.query<MatrizResumo>(
        `select id, nome, brinco, raca, ativa
         from public.matrizes
         where ativa = $1
         order by nome asc`,
        [somenteAtivos],
      );
      return resultado.rows;
    }),
    buscarResumosInseminacao(databaseUrl, cadastroId),
  ]);
  const enriquecidas = linhas.map((m) =>
    enriquecerComSituacao(m, inseminacoes.get(m.id)),
  );
  const q = consulta?.trim() ?? "";
  if (!q) return enriquecidas;
  return enriquecidas.filter(
    (m) =>
      textoBuscaCoincide(m.nome, q) ||
      (m.brinco != null && textoBuscaCoincide(m.brinco, q)),
  );
}

export async function obterMatrizComSituacao(
  databaseUrl: string,
  cadastroId: string,
  id: string,
): Promise<(MatrizDetalhe & MatrizResumoComSituacao) | null> {
  const [detalhe, inseminacoes] = await Promise.all([
    obterMatriz(databaseUrl, cadastroId, id),
    buscarResumosInseminacao(databaseUrl, cadastroId),
  ]);
  if (!detalhe) return null;
  return {
    ...detalhe,
    ...enriquecerComSituacao(detalhe, inseminacoes.get(id)),
  };
}

export async function listarHistoricoMatriz(
  databaseUrl: string,
  cadastroId: string,
  matrizId: string,
): Promise<{ historico: HistoricoInseminacaoMatriz[]; repeticoes: number }> {
  const historico = await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<{
      id: string;
      data: string;
      tipo: string;
      status: StatusInseminacao;
      numero_tentativa: number;
      data_diagnostico_prevista: string | null;
      previsao_parto: string | null;
      observacoes: string | null;
      reprodutor_nome: string;
      inseminador_nome: string;
      lote_nome: string | null;
    }>(
      `select i.id, i.data::text as data, i.tipo, i.status, i.numero_tentativa,
              i.data_diagnostico_prevista::text,
              i.previsao_parto::text,
              i.observacoes,
              r.nome as reprodutor_nome,
              ins.nome as inseminador_nome,
              l.nome as lote_nome
       from public.inseminacoes i
       inner join public.reprodutores r on r.id = i.reprodutor_id
       inner join public.inseminadores ins on ins.id = i.inseminador_id
       left join public.lotes l on l.id = i.lote_id
       where i.matriz_id = $1
       order by i.data desc, i.numero_tentativa desc`,
      [matrizId],
    );
    return {
      linhas: resultado.rows,
      itens: resultado.rows.map((linha) => ({
        id: linha.id,
        data: formatarDataIsoParaBr(linha.data),
        tipo: mapTipoInseminacao(linha.tipo),
        status: linha.status,
        numeroTentativa: linha.numero_tentativa,
        reprodutor: linha.reprodutor_nome,
        inseminador: linha.inseminador_nome,
        lote: linha.lote_nome,
        dataDiagnosticoPrevista: linha.data_diagnostico_prevista
          ? formatarDataIsoParaBr(linha.data_diagnostico_prevista)
          : null,
        previsaoParto: linha.previsao_parto
          ? formatarDataIsoParaBr(linha.previsao_parto)
          : null,
        observacoes: linha.observacoes,
      })),
    };
  });
  const repeticoes = contarRepeticoesMatriz(
    historico.linhas.map((linha) => ({
      data: linha.data,
      status: linha.status,
      numeroTentativa: linha.numero_tentativa,
    })),
  );
  return { historico: historico.itens, repeticoes };
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