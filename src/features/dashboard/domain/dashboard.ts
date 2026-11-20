import { adicionarDias } from "../../inseminacoes/domain/calculos";
import { formatarDataIsoParaBr } from "../../matrizes/domain/resumo-reprodutivo";
import type { SituacaoMatriz } from "../../matrizes/domain/resumo-reprodutivo";

function parseDataIso(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function intervaloMesCalendario(isoHoje: string): {
  inicio: string;
  fim: string;
} {
  const [y, m] = isoHoje.split("-");
  const ano = Number(y);
  const mes = Number(m);
  const inicio = `${y}-${m}-01`;
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const fim = `${y}-${m}-${String(ultimoDia).padStart(2, "0")}`;
  return { inicio, fim };
}

export function contarDatasNoIntervalo(
  datas: string[],
  inicio: string,
  fim: string,
): number {
  return datas.filter((d) => d >= inicio && d <= fim).length;
}

export function contarMatrizesAtivasPorSituacao(
  matrizes: { ativa: boolean; situacao: SituacaoMatriz }[],
): { aguardando: number; prenhes: number; vazias: number } {
  let aguardando = 0;
  let prenhes = 0;
  let vazias = 0;
  for (const m of matrizes) {
    if (!m.ativa) continue;
    if (m.situacao === "pendente") aguardando++;
    else if (m.situacao === "prenhe") prenhes++;
    else if (m.situacao === "vazia") vazias++;
  }
  return { aguardando, prenhes, vazias };
}

export function contarDiagnosticosVencendoEmDias(
  datasDiagnostico: string[],
  hoje: string,
  dias: number,
): number {
  const fim = adicionarDias(hoje, dias);
  return datasDiagnostico.filter(
    (data) => data >= hoje && data <= fim,
  ).length;
}

export function diasEntre(hoje: string, futuro: string): number {
  const diff = parseDataIso(futuro) - parseDataIso(hoje);
  return Math.round(diff / 86_400_000);
}

export type PartoPrevistoEntrada = {
  matrizId: string;
  nome: string;
  brinco: string | null;
  previsaoParto: string;
};

export type PartoPrevistoExibicao = PartoPrevistoEntrada & {
  dias: number;
  dataBr: string;
};

export function ordenarProximosPartos(
  itens: PartoPrevistoEntrada[],
  hoje: string,
  limite = 10,
): PartoPrevistoExibicao[] {
  return [...itens]
    .filter((i) => i.previsaoParto >= hoje)
    .sort((a, b) => a.previsaoParto.localeCompare(b.previsaoParto))
    .slice(0, limite)
    .map((i) => ({
      ...i,
      dias: diasEntre(hoje, i.previsaoParto),
      dataBr: formatarDataIsoParaBr(i.previsaoParto),
    }));
}