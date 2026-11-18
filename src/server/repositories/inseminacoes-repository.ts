import { randomUUID } from "node:crypto";
import {
  calcularDataDiagnosticoPrevista,
  calcularProximaTentativa,
  matrizComInseminacaoPendente,
  type InseminacaoResumo,
} from "../../features/inseminacoes/domain/calculos";
import {
  STATUS_INICIAL_INSEMINACAO,
  validarDataInseminacao,
} from "../../features/inseminacoes/domain/registrar";
import { comCadastroId } from "../db/context";

export type TipoInseminacaoDb = "CN" | "IATF" | "PROTOCOLO";

export class ErroInseminacao extends Error {
  constructor(
    message: string,
    readonly codigo:
      | "validacao"
      | "nao_encontrada"
      | "matriz_invalida",
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

async function historicoMatriz(
  databaseUrl: string,
  cadastroId: string,
  matrizId: string,
): Promise<InseminacaoResumo[]> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
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
  });
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