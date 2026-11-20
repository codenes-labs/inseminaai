import {
  contarDatasNoIntervalo,
  contarMatrizesAtivasPorSituacao,
  intervaloMesCalendario,
  listarDiagnosticosVencendoEmDias,
  ordenarProximosPartos,
} from "../../features/dashboard/domain/dashboard";
import { derivarSituacaoDaUltimaInseminacao } from "../../features/matrizes/domain/resumo-reprodutivo";
import type { StatusInseminacao } from "../../features/inseminacoes/domain/calculos";
import { comCadastroId } from "../db/context";

type LinhaInseminacao = {
  id: string;
  matriz_id: string;
  data: string;
  tipo: string;
  status: StatusInseminacao;
  numero_tentativa: number;
  data_diagnostico_prevista: string | null;
  previsao_parto: string | null;
  reprodutor: string;
};

export type DashboardDto = {
  inseminadasMes: number;
  aguardando: number;
  prenhes: number;
  vazias: number;
  diagnosticosVencendo7Dias: number;
  diagnosticosProximos7Dias: {
    matrizId: string;
    nome: string;
    brinco: string | null;
    dataBr: string;
    dias: number;
  }[];
  proximosPartos: {
    matrizId: string;
    nome: string;
    brinco: string | null;
    dataBr: string;
    dias: number;
  }[];
  ultimasInseminacoes: {
    matrizId: string;
    nome: string;
    brinco: string | null;
    dataBr: string;
    tipo: string;
    reprodutor: string;
  }[];
};

function mapTipo(tipo: string): string {
  if (tipo === "PROTOCOLO") return "Protocolo";
  return tipo;
}

function formatarDataBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export async function obterDashboard(
  databaseUrl: string,
  cadastroId: string,
  hoje: string,
): Promise<DashboardDto> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const matrizesRes = await cliente.query<{
      id: string;
      nome: string;
      brinco: string | null;
      ativa: boolean;
    }>(`select id, nome, brinco, ativa from public.matrizes`);

    const insemRes = await cliente.query<LinhaInseminacao>(
      `select i.id, i.matriz_id::text, i.data::text as data, i.tipo,
              i.status, i.numero_tentativa,
              i.data_diagnostico_prevista::text,
              i.previsao_parto::text,
              r.nome as reprodutor
       from public.inseminacoes i
       join public.reprodutores r on r.id = i.reprodutor_id
       order by i.data desc, i.numero_tentativa desc`,
    );

    const porMatriz = new Map<string, LinhaInseminacao[]>();
    for (const linha of insemRes.rows) {
      const grupo = porMatriz.get(linha.matriz_id) ?? [];
      grupo.push(linha);
      porMatriz.set(linha.matriz_id, grupo);
    }

    const { inicio, fim } = intervaloMesCalendario(hoje);
    const todasDatas = insemRes.rows.map((r) => r.data);
    const inseminadasMes = contarDatasNoIntervalo(todasDatas, inicio, fim);

    const matrizesComSituacao = matrizesRes.rows.map((m) => {
      const historico =
        porMatriz.get(m.id)?.map((h) => ({
          data: h.data,
          status: h.status,
          numeroTentativa: h.numero_tentativa,
        })) ?? [];
      const { situacao } = derivarSituacaoDaUltimaInseminacao(historico);
      return { ...m, situacao };
    });

    const { aguardando, prenhes, vazias } =
      contarMatrizesAtivasPorSituacao(matrizesComSituacao);

    const diagnosticosPendentes: {
      matrizId: string;
      nome: string;
      brinco: string | null;
      dataDiagnostico: string;
    }[] = [];
    const partos: Parameters<typeof ordenarProximosPartos>[0] = [];

    for (const m of matrizesComSituacao) {
      if (!m.ativa) continue;
      const linhas = porMatriz.get(m.id);
      if (!linhas?.length) continue;
      const historico = linhas.map((h) => ({
        data: h.data,
        status: h.status,
        numeroTentativa: h.numero_tentativa,
      }));
      const { situacao: situacaoUltima } =
        derivarSituacaoDaUltimaInseminacao(historico);
      const linhaCompleta = [...linhas].sort((a, b) => {
        const porData = b.data.localeCompare(a.data);
        if (porData !== 0) return porData;
        return b.numero_tentativa - a.numero_tentativa;
      })[0];
      if (!linhaCompleta) continue;
      if (
        situacaoUltima === "pendente" &&
        linhaCompleta.data_diagnostico_prevista
      ) {
        diagnosticosPendentes.push({
          matrizId: m.id,
          nome: m.nome,
          brinco: m.brinco,
          dataDiagnostico: linhaCompleta.data_diagnostico_prevista,
        });
      }
      if (situacaoUltima === "prenhe" && linhaCompleta.previsao_parto) {
        partos.push({
          matrizId: m.id,
          nome: m.nome,
          brinco: m.brinco,
          previsaoParto: linhaCompleta.previsao_parto,
        });
      }
    }

    const diagnosticosProximos7Dias = listarDiagnosticosVencendoEmDias(
      diagnosticosPendentes,
      hoje,
      7,
    ).map((d) => ({
      matrizId: d.matrizId,
      nome: d.nome,
      brinco: d.brinco,
      dataBr: d.dataBr,
      dias: d.dias,
    }));
    const diagnosticosVencendo7Dias = diagnosticosProximos7Dias.length;

    const proximosPartos = ordenarProximosPartos(partos, hoje).map((p) => ({
      matrizId: p.matrizId,
      nome: p.nome,
      brinco: p.brinco,
      dataBr: p.dataBr,
      dias: p.dias,
    }));

    const ultimasInseminacoes = insemRes.rows.slice(0, 5).map((linha) => {
      const matriz = matrizesRes.rows.find((m) => m.id === linha.matriz_id);
      return {
        matrizId: linha.matriz_id,
        nome: matriz?.nome ?? "—",
        brinco: matriz?.brinco ?? null,
        dataBr: formatarDataBr(linha.data),
        tipo: mapTipo(linha.tipo),
        reprodutor: linha.reprodutor,
      };
    });

    return {
      inseminadasMes,
      aguardando,
      prenhes,
      vazias,
      diagnosticosVencendo7Dias,
      diagnosticosProximos7Dias,
      proximosPartos,
      ultimasInseminacoes,
    };
  });
}