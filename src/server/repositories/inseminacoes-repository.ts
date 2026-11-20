import { randomUUID } from "node:crypto";
import {
  calcularDataDiagnosticoPrevista,
  calcularProximaTentativa,
  matrizComInseminacaoPendente,
  type InseminacaoResumo,
} from "../../features/inseminacoes/domain/calculos";
import {
  calcularCamposDiagnostico,
  type ResultadoDiagnostico,
  validarRegistroDiagnostico,
} from "../../features/inseminacoes/domain/diagnostico";
import {
  STATUS_INICIAL_INSEMINACAO,
  validarDataInseminacao,
} from "../../features/inseminacoes/domain/registrar";
import {
  normalizarIdsMatrizes,
  validarLancamentoLote,
} from "../../features/inseminacoes/domain/lancamento-lote";
import type { DbCliente } from "../db/context";
import { comCadastroId } from "../db/context";

export type TipoInseminacaoDb = "CN" | "IATF" | "PROTOCOLO";

export class ErroInseminacao extends Error {
  constructor(
    message: string,
    readonly codigo:
      | "validacao"
      | "nao_encontrada"
      | "matriz_invalida"
      | "sem_pendente",
  ) {
    super(message);
    this.name = "ErroInseminacao";
  }
}

export function mapTipoParaDb(tipo: string): TipoInseminacaoDb {
  const mapa: Record<string, TipoInseminacaoDb> = {
    CN: "CN",
    IATF: "IATF",
    Protocolo: "PROTOCOLO",
    PROTOCOLO: "PROTOCOLO",
  };
  const convertido = mapa[tipo];
  if (!convertido) {
    throw new ErroInseminacao("Tipo de inseminação inválido.", "validacao");
  }
  return convertido;
}

async function historicoMatrizNoCliente(
  cliente: DbCliente,
  matrizId: string,
): Promise<InseminacaoResumo[]> {
  const resultado = await cliente.query<{
    numero_tentativa: number;
    status: InseminacaoResumo["status"];
  }>(
    `select numero_tentativa, status
     from public.inseminacoes
     where matriz_id = $1
     order by numero_tentativa asc`,
    [matrizId],
  );
  return resultado.rows.map((linha) => ({
    numeroTentativa: linha.numero_tentativa,
    status: linha.status,
  }));
}

async function historicoMatriz(
  databaseUrl: string,
  cadastroId: string,
  matrizId: string,
): Promise<InseminacaoResumo[]> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) =>
    historicoMatrizNoCliente(cliente, matrizId),
  );
}

export async function contextoMatrizInseminacao(
  databaseUrl: string,
  cadastroId: string,
  matrizId: string,
): Promise<{ temPendente: boolean; proximaTentativa: number }> {
  const historico = await historicoMatriz(databaseUrl, cadastroId, matrizId);
  return {
    temPendente: matrizComInseminacaoPendente(historico),
    proximaTentativa: calcularProximaTentativa(historico),
  };
}

export async function ultimoInseminadorId(
  databaseUrl: string,
  cadastroId: string,
): Promise<string | null> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<{ inseminador_id: string }>(
      `select inseminador_id
       from public.inseminacoes
       order by created_at desc
       limit 1`,
    );
    return resultado.rows[0]?.inseminador_id ?? null;
  });
}

export type CriarInseminacaoInput = {
  matriz_id: string;
  reprodutor_id: string;
  inseminador_id: string;
  lote_id?: string | null;
  data: string;
  tipo: string;
  observacoes?: string | null;
  hoje: string;
};

export type InseminacaoCriada = {
  id: string;
  matriz_id: string;
  numero_tentativa: number;
  status: typeof STATUS_INICIAL_INSEMINACAO;
  data_diagnostico_prevista: string;
};

export async function criarInseminacao(
  databaseUrl: string,
  cadastroId: string,
  input: CriarInseminacaoInput,
): Promise<InseminacaoCriada> {
  const erroData = validarDataInseminacao(input.data, input.hoje);
  if (erroData) throw new ErroInseminacao(erroData, "validacao");

  const matrizOk = await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<{ id: string }>(
      `select id from public.matrizes where id = $1 and ativa = true`,
      [input.matriz_id],
    );
    return Boolean(resultado.rows[0]);
  });
  if (!matrizOk) {
    throw new ErroInseminacao("Matriz não encontrada.", "matriz_invalida");
  }

  const historico = await historicoMatriz(databaseUrl, cadastroId, input.matriz_id);
  const numeroTentativa = calcularProximaTentativa(historico);
  const dataDiagnosticoPrevista = calcularDataDiagnosticoPrevista(input.data);
  const tipoDb = mapTipoParaDb(input.tipo);
  const id = randomUUID();
  const observacoes = input.observacoes?.trim() || null;

  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    await cliente.query(
      `insert into public.inseminacoes (
         id, cadastro_id, matriz_id, reprodutor_id, inseminador_id, lote_id,
         data, tipo, numero_tentativa, status, data_diagnostico_prevista, observacoes
       ) values (
         $1, $2, $3, $4, $5, $6,
         $7::date, $8, $9, $10, $11::date, $12
       )`,
      [
        id,
        cadastroId,
        input.matriz_id,
        input.reprodutor_id,
        input.inseminador_id,
        input.lote_id ?? null,
        input.data,
        tipoDb,
        numeroTentativa,
        STATUS_INICIAL_INSEMINACAO,
        dataDiagnosticoPrevista,
        observacoes,
      ],
    );
    return {
      id,
      matriz_id: input.matriz_id,
      numero_tentativa: numeroTentativa,
      status: STATUS_INICIAL_INSEMINACAO,
      data_diagnostico_prevista: dataDiagnosticoPrevista,
    };
  });
}

export type CriarLoteInput = {
  matriz_ids: string[];
  reprodutor_id: string;
  inseminador_id: string;
  lote_id?: string | null;
  data: string;
  tipo: string;
  observacoes?: string | null;
  hoje: string;
};

export type MatrizPendenciaLote = {
  matriz_id: string;
  nome: string;
};

export type ResultadoLancamentoLote = {
  criadas: InseminacaoCriada[];
  matrizes_com_pendencia: MatrizPendenciaLote[];
};

export async function listarMatrizesPendentesNoLote(
  databaseUrl: string,
  cadastroId: string,
  matrizIds: string[],
): Promise<MatrizPendenciaLote[]> {
  const ids = normalizarIdsMatrizes(matrizIds);
  if (ids.length === 0) return [];

  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<MatrizPendenciaLote>(
      `select m.id::text as matriz_id, m.nome
       from public.matrizes m
       where m.id = any($1::uuid[])
         and m.ativa
         and exists (
           select 1 from public.inseminacoes i
           where i.matriz_id = m.id and i.status = 'pendente'
         )
       order by m.nome asc`,
      [ids],
    );
    return resultado.rows;
  });
}

export async function criarInseminacoesEmLote(
  databaseUrl: string,
  cadastroId: string,
  input: CriarLoteInput,
): Promise<ResultadoLancamentoLote> {
  const erro = validarLancamentoLote({
    matriz_ids: input.matriz_ids,
    data: input.data,
    tipo: input.tipo,
    reprodutor_id: input.reprodutor_id,
    inseminador_id: input.inseminador_id,
    hoje: input.hoje,
  });
  if (erro) throw new ErroInseminacao(erro, "validacao");

  const matrizIds = normalizarIdsMatrizes(input.matriz_ids);
  const pendentesAntes = await listarMatrizesPendentesNoLote(
    databaseUrl,
    cadastroId,
    matrizIds,
  );

  const tipoDb = mapTipoParaDb(input.tipo);
  const observacoes = input.observacoes?.trim() || null;

  const criadas = await comCadastroId(
    databaseUrl,
    cadastroId,
    async (cliente) => {
      const saida: InseminacaoCriada[] = [];

      for (const matriz_id of matrizIds) {
        const matrizOk = await cliente.query<{ id: string }>(
          `select id from public.matrizes where id = $1 and ativa = true`,
          [matriz_id],
        );
        if (!matrizOk.rows[0]) {
          throw new ErroInseminacao(
            "Uma das matrizes não está ativa.",
            "matriz_invalida",
          );
        }

        const historico = await historicoMatrizNoCliente(cliente, matriz_id);
        const numeroTentativa = calcularProximaTentativa(historico);
        const dataDiagnosticoPrevista = calcularDataDiagnosticoPrevista(
          input.data,
        );
        const id = randomUUID();

        await cliente.query(
          `insert into public.inseminacoes (
             id, cadastro_id, matriz_id, reprodutor_id, inseminador_id, lote_id,
             data, tipo, numero_tentativa, status, data_diagnostico_prevista, observacoes
           ) values (
             $1, $2, $3, $4, $5, $6,
             $7::date, $8, $9, $10, $11::date, $12
           )`,
          [
            id,
            cadastroId,
            matriz_id,
            input.reprodutor_id,
            input.inseminador_id,
            input.lote_id ?? null,
            input.data,
            tipoDb,
            numeroTentativa,
            STATUS_INICIAL_INSEMINACAO,
            dataDiagnosticoPrevista,
            observacoes,
          ],
        );

        saida.push({
          id,
          matriz_id,
          numero_tentativa: numeroTentativa,
          status: STATUS_INICIAL_INSEMINACAO,
          data_diagnostico_prevista: dataDiagnosticoPrevista,
        });
      }

      return saida;
    },
  );

  return { criadas, matrizes_com_pendencia: pendentesAntes };
}

export type InseminacaoPendente = {
  id: string;
  matriz_id: string;
  data: string;
  numero_tentativa: number;
  tipo: TipoInseminacaoDb;
};

export async function obterInseminacaoPendenteDaMatriz(
  databaseUrl: string,
  cadastroId: string,
  matrizId: string,
): Promise<InseminacaoPendente | null> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<{
      id: string;
      matriz_id: string;
      data: string;
      numero_tentativa: number;
      tipo: TipoInseminacaoDb;
    }>(
      `select id, matriz_id, data::text, numero_tentativa, tipo
       from public.inseminacoes
       where matriz_id = $1 and status = 'pendente'
       order by created_at desc
       limit 1`,
      [matrizId],
    );
    const linha = resultado.rows[0];
    if (!linha) return null;
    return {
      id: linha.id,
      matriz_id: linha.matriz_id,
      data: linha.data,
      numero_tentativa: linha.numero_tentativa,
      tipo: linha.tipo,
    };
  });
}

export type RegistrarDiagnosticoInput = {
  resultado: string;
  data_diagnostico: string;
  observacoes?: string | null;
  hoje: string;
};

export type DiagnosticoRegistrado = {
  id: string;
  matriz_id: string;
  status: ResultadoDiagnostico;
  data_diagnostico: string;
  previsao_parto: string | null;
};

export async function registrarDiagnostico(
  databaseUrl: string,
  cadastroId: string,
  inseminacaoId: string,
  input: RegistrarDiagnosticoInput,
): Promise<DiagnosticoRegistrado> {
  const pendente = await comCadastroId(
    databaseUrl,
    cadastroId,
    async (cliente) => {
      const resultado = await cliente.query<{
        id: string;
        matriz_id: string;
        data: string;
        status: string;
        observacoes: string | null;
      }>(
        `select id, matriz_id, data::text, status, observacoes
         from public.inseminacoes
         where id = $1`,
        [inseminacaoId],
      );
      return resultado.rows[0] ?? null;
    },
  );

  if (!pendente) {
    throw new ErroInseminacao("Inseminação não encontrada.", "nao_encontrada");
  }
  if (pendente.status !== "pendente") {
    throw new ErroInseminacao(
      "Esta inseminação já tem diagnóstico registrado.",
      "sem_pendente",
    );
  }

  const erro = validarRegistroDiagnostico({
    dataInseminacao: pendente.data,
    dataDiagnostico: input.data_diagnostico,
    resultado: input.resultado,
    hoje: input.hoje,
  });
  if (erro) throw new ErroInseminacao(erro, "validacao");

  const resultado = input.resultado as ResultadoDiagnostico;
  const campos = calcularCamposDiagnostico(
    pendente.data,
    input.data_diagnostico,
    resultado,
  );
  const observacoesNovas = input.observacoes?.trim();
  const observacoes =
    observacoesNovas != null && observacoesNovas !== ""
      ? observacoesNovas
      : pendente.observacoes;

  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    await cliente.query(
      `update public.inseminacoes
       set status = $2,
           data_diagnostico = $3::date,
           previsao_parto = $4::date,
           observacoes = $5
       where id = $1`,
      [
        inseminacaoId,
        campos.status,
        campos.data_diagnostico,
        campos.previsao_parto,
        observacoes,
      ],
    );
    return {
      id: inseminacaoId,
      matriz_id: pendente.matriz_id,
      status: campos.status,
      data_diagnostico: campos.data_diagnostico,
      previsao_parto: campos.previsao_parto,
    };
  });
}