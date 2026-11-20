import {
  formatarDataIsoParaBr,
  mapTipoInseminacaoParaExportacao,
  montarCsvInseminacoes,
  type LinhaExportacaoInseminacao,
} from "../../features/relatorios/domain/exportacao-csv";
import {
  agruparTaxaPrenhez,
  calcularTaxaPrenhez,
  mediaRepeticoesPorMatriz,
} from "../../features/relatorios/domain/taxas";
import type { StatusInseminacao } from "../../features/inseminacoes/domain/calculos";
import { derivarSituacaoDaUltimaInseminacao } from "../../features/matrizes/domain/resumo-reprodutivo";
import type { PeriodoRelatorio } from "../../features/relatorios/domain/periodo";
import { comCadastroId } from "../db/context";

export type ResumoRelatorios = {
  periodo: PeriodoRelatorio;
  taxaPrenhezGeral: number;
  prenhes: number;
  diagnosticadas: number;
  inseminadasMes: number;
  pendentes: number;
  porSituacao: { prenhe: number; pendente: number; vazia: number; sem: number };
  taxaPorReprodutor: { chave: string; taxaPercentual: number; diagnosticadas: number }[];
  taxaPorTipo: { chave: string; taxaPercentual: number; diagnosticadas: number }[];
  taxaPorLote: { chave: string; taxaPercentual: number; diagnosticadas: number }[];
  mediaRepeticoes: number;
};

function noPeriodo(data: string, periodo: PeriodoRelatorio): boolean {
  return data >= periodo.inicio && data <= periodo.fim;
}

export async function obterResumoRelatorios(
  databaseUrl: string,
  cadastroId: string,
  periodo: PeriodoRelatorio,
): Promise<ResumoRelatorios> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const insem = await cliente.query<{
      status: string;
      tipo: string;
      data: string;
      numero_tentativa: number;
      matriz_id: string;
      reprodutor: string;
      lote: string | null;
    }>(
      `select i.status, i.tipo, i.data::text, i.numero_tentativa, i.matriz_id::text,
              r.nome as reprodutor, l.nome as lote
       from public.inseminacoes i
       join public.reprodutores r on r.id = i.reprodutor_id
       left join public.lotes l on l.id = i.lote_id`,
    );

    const matrizes = await cliente.query<{
      id: string;
      ativa: boolean;
    }>(`select id::text, ativa from public.matrizes`);

    const insemPeriodo = insem.rows.filter((r) => noPeriodo(r.data, periodo));

    const porMatriz = new Map<
      string,
      { data: string; status: StatusInseminacao; numeroTentativa: number }[]
    >();
    for (const row of insemPeriodo) {
      const grupo = porMatriz.get(row.matriz_id) ?? [];
      grupo.push({
        data: row.data,
        status: row.status as StatusInseminacao,
        numeroTentativa: row.numero_tentativa,
      });
      porMatriz.set(row.matriz_id, grupo);
    }

    const porSituacao = { prenhe: 0, pendente: 0, vazia: 0, sem: 0 };
    for (const m of matrizes.rows) {
      if (!m.ativa) continue;
      const historico = porMatriz.get(m.id) ?? [];
      if (historico.length === 0) {
        porSituacao.sem++;
        continue;
      }
      const { situacao } = derivarSituacaoDaUltimaInseminacao(historico);
      porSituacao[situacao]++;
    }

    const inseminadasMes = insemPeriodo.length;

    const prenhes = insemPeriodo.filter((r) => r.status === "prenhe").length;
    const diagnosticadas = insemPeriodo.filter((r) =>
      ["prenhe", "vazia"].includes(r.status),
    ).length;
    const pendentes = insemPeriodo.filter((r) => r.status === "pendente").length;

    const itensTaxa = insemPeriodo.map((r) => ({
      grupoReprodutor: r.reprodutor,
      grupoTipo: mapTipoInseminacaoParaExportacao(r.tipo),
      grupoLote: r.lote?.trim() || "Sem lote",
      prenhe: r.status === "prenhe",
      diagnosticada: r.status === "prenhe" || r.status === "vazia",
    }));

    const taxaPorReprodutor = agruparTaxaPrenhez(
      itensTaxa.map((i) => ({
        grupo: i.grupoReprodutor,
        prenhe: i.prenhe,
        diagnosticada: i.diagnosticada,
      })),
    ).map((g) => ({
      chave: g.chave,
      taxaPercentual: g.taxaPercentual,
      diagnosticadas: g.diagnosticadas,
    }));

    const taxaPorTipo = agruparTaxaPrenhez(
      itensTaxa.map((i) => ({
        grupo: i.grupoTipo,
        prenhe: i.prenhe,
        diagnosticada: i.diagnosticada,
      })),
    ).map((g) => ({
      chave: g.chave,
      taxaPercentual: g.taxaPercentual,
      diagnosticadas: g.diagnosticadas,
    }));

    const taxaPorLote = agruparTaxaPrenhez(
      itensTaxa.map((i) => ({
        grupo: i.grupoLote,
        prenhe: i.prenhe,
        diagnosticada: i.diagnosticada,
      })),
    ).map((g) => ({
      chave: g.chave,
      taxaPercentual: g.taxaPercentual,
      diagnosticadas: g.diagnosticadas,
    }));

    const maxPorMatriz = [...porMatriz.values()]
      .filter((hist) => hist.length > 0)
      .map((hist) => Math.max(...hist.map((h) => h.numeroTentativa)));

    return {
      periodo,
      taxaPrenhezGeral: calcularTaxaPrenhez(prenhes, diagnosticadas),
      prenhes,
      diagnosticadas,
      inseminadasMes,
      pendentes,
      porSituacao,
      taxaPorReprodutor,
      taxaPorTipo,
      taxaPorLote,
      mediaRepeticoes: mediaRepeticoesPorMatriz(maxPorMatriz),
    };
  });
}

export async function exportarInseminacoesCsv(
  databaseUrl: string,
  cadastroId: string,
  periodo?: PeriodoRelatorio,
): Promise<string> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const filtroData =
      periodo ?
        `where i.data >= $1::date and i.data <= $2::date`
      : "";
    const params = periodo ? [periodo.inicio, periodo.fim] : [];

    const resultado = await cliente.query<{
      matriz: string;
      brinco: string | null;
      reprodutor: string;
      inseminador: string;
      data: string;
      tipo: string;
      lote: string | null;
    }>(
      `select m.nome as matriz, m.brinco,
              r.nome as reprodutor, ins.nome as inseminador,
              i.data::text as data, i.tipo, l.nome as lote
       from public.inseminacoes i
       join public.matrizes m on m.id = i.matriz_id
       join public.reprodutores r on r.id = i.reprodutor_id
       join public.inseminadores ins on ins.id = i.inseminador_id
       left join public.lotes l on l.id = i.lote_id
       ${filtroData}
       order by i.data desc, m.nome asc, i.numero_tentativa asc`,
      params,
    );

    const linhas: LinhaExportacaoInseminacao[] = resultado.rows.map((row) => ({
      matriz: row.matriz,
      brinco: row.brinco ?? "",
      reprodutor: row.reprodutor,
      inseminador: row.inseminador,
      data: formatarDataIsoParaBr(row.data),
      tipo: mapTipoInseminacaoParaExportacao(row.tipo),
      lote: row.lote ?? "",
    }));

    return montarCsvInseminacoes(linhas);
  });
}