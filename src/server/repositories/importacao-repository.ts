import { randomUUID } from "node:crypto";
import {
  montarPlanoImportacao,
  parsearCsv,
  type LinhaImportacao,
} from "../../features/importacao/domain/csv";
import {
  calcularDataDiagnosticoPrevistaParaMatriz,
  type DiagnosticoHistorico,
} from "../../features/inseminacoes/domain/previsao-diagnostico";
import { mapTipoParaDb } from "./inseminacoes-repository";
import { STATUS_INICIAL_INSEMINACAO } from "../../features/inseminacoes/domain/registrar";
import { comCadastroId } from "../db/context";

export type ResultadoImportacao = {
  criadas: number;
  ignoradas: number;
  erros: string[];
};

async function obterOuCriarMatriz(
  cliente: {
    query: (
      sql: string,
      params?: unknown[],
    ) => Promise<{ rows: { id: string }[] }>;
  },
  cadastroId: string,
  nome: string,
  brinco: string | null,
): Promise<string> {
  const resultado = (await cliente.query(
    `select id from public.matrizes
     where cadastro_id = $1 and lower(trim(nome)) = lower(trim($2))
     limit 1`,
    [cadastroId, nome],
  )) as { rows: { id: string }[] };
  const existente = resultado.rows[0];
  if (existente) return existente.id;
  const id = randomUUID();
  await cliente.query(
    `insert into public.matrizes (id, cadastro_id, nome, brinco, ativa)
     values ($1, $2, $3, $4, true)`,
    [id, cadastroId, nome.trim(), brinco],
  );
  return id;
}

async function obterOuCriarPorNome(
  cliente: {
    query: (
      sql: string,
      params?: unknown[],
    ) => Promise<{ rows: { id: string }[] }>;
  },
  tabela: "reprodutores" | "inseminadores" | "lotes",
  cadastroId: string,
  nome: string,
  extra?: { dataInicio?: string },
): Promise<string> {
  const resultado = (await cliente.query(
    `select id from public.${tabela}
     where cadastro_id = $1 and lower(trim(nome)) = lower(trim($2))
     limit 1`,
    [cadastroId, nome],
  )) as { rows: { id: string }[] };
  const existente = resultado.rows[0];
  if (existente) return existente.id;
  const id = randomUUID();
  if (tabela === "lotes") {
    await cliente.query(
      `insert into public.lotes (id, cadastro_id, nome, data_inicio, ativo)
       values ($1, $2, $3, $4::date, true)`,
      [id, cadastroId, nome.trim(), extra?.dataInicio ?? new Date().toISOString().slice(0, 10)],
    );
  } else {
    await cliente.query(
      `insert into public.${tabela} (id, cadastro_id, nome, ativo)
       values ($1, $2, $3, true)`,
      [id, cadastroId, nome.trim()],
    );
  }
  return id;
}

async function inserirLinha(
  cliente: {
    query: (
      sql: string,
      params?: unknown[],
    ) => Promise<unknown>;
  },
  cadastroId: string,
  matrizId: string,
  linha: LinhaImportacao,
  reprodutorId: string,
  inseminadorId: string,
  loteId: string | null,
): Promise<"criada" | "ignorada"> {
  const duplicada = await cliente.query(
    `select id from public.inseminacoes
     where cadastro_id = $1 and importacao_chave = $2`,
    [cadastroId, linha.chaveIdempotencia],
  ) as { rows: { id: string }[] };
  if (duplicada.rows[0]) {
    return "ignorada";
  }

  if (linha.numeroTentativa > 1) {
    await cliente.query(
      `update public.inseminacoes
       set status = 'vazia', previsao_parto = null, data_diagnostico = coalesce(data_diagnostico, data)
       where matriz_id = $1
         and numero_tentativa < $2
         and status = 'pendente'`,
      [matrizId, linha.numeroTentativa],
    );
  }

  const historicoDiag = (await cliente.query(
    `select data::text as data, data_diagnostico::text
     from public.inseminacoes
     where matriz_id = $1 and data_diagnostico is not null`,
    [matrizId],
  )) as { rows: { data: string; data_diagnostico: string }[] };
  const diagHistorico: DiagnosticoHistorico[] = historicoDiag.rows.map(
    (linha) => ({
      dataInseminacao: linha.data,
      dataDiagnostico: linha.data_diagnostico,
    }),
  );
  const dataDiagnosticoPrevista = calcularDataDiagnosticoPrevistaParaMatriz(
    linha.dataIso,
    diagHistorico,
  ).dataPrevista;
  const id = randomUUID();
  const tipoDb = mapTipoParaDb(linha.tipo);

  await cliente.query(
    `insert into public.inseminacoes (
       id, cadastro_id, matriz_id, reprodutor_id, inseminador_id, lote_id,
       data, tipo, numero_tentativa, status, data_diagnostico_prevista,
       importacao_chave
     ) values (
       $1, $2, $3, $4, $5, $6,
       $7::date, $8, $9, $10, $11::date, $12
     )`,
    [
      id,
      cadastroId,
      matrizId,
      reprodutorId,
      inseminadorId,
      loteId,
      linha.dataIso,
      tipoDb,
      linha.numeroTentativa,
      STATUS_INICIAL_INSEMINACAO,
      dataDiagnosticoPrevista,
      linha.chaveIdempotencia,
    ],
  );
  return "criada";
}

export async function importarCsv(
  databaseUrl: string,
  cadastroId: string,
  conteudoCsv: string,
): Promise<ResultadoImportacao> {
  const bruto = parsearCsv(conteudoCsv);
  const { linhas, erros } = montarPlanoImportacao(bruto);
  if (linhas.length === 0 && erros.length > 0) {
    return { criadas: 0, ignoradas: 0, erros };
  }

  let criadas = 0;
  let ignoradas = 0;

  await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    for (const linha of linhas) {
      try {
        const matrizId = await obterOuCriarMatriz(
          cliente,
          cadastroId,
          linha.matriz,
          linha.brinco,
        );
        const reprodutorId = await obterOuCriarPorNome(
          cliente,
          "reprodutores",
          cadastroId,
          linha.reprodutor,
        );
        const inseminadorId = await obterOuCriarPorNome(
          cliente,
          "inseminadores",
          cadastroId,
          linha.inseminador,
        );
        const loteId = linha.lote
          ? await obterOuCriarPorNome(cliente, "lotes", cadastroId, linha.lote, {
              dataInicio: linha.dataIso,
            })
          : null;
        const resultado = await inserirLinha(
          cliente,
          cadastroId,
          matrizId,
          linha,
          reprodutorId,
          inseminadorId,
          loteId,
        );
        if (resultado === "criada") criadas++;
        else ignoradas++;
      } catch (cause) {
        erros.push(
          cause instanceof Error
            ? `${linha.matriz} (${linha.dataIso}): ${cause.message}`
            : `Falha em ${linha.matriz}.`,
        );
      }
    }
  });

  return { criadas, ignoradas, erros };
}