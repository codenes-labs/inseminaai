import type { StatusInseminacao } from "../../inseminacoes/domain/calculos";
import { contarRepeticoes } from "../../inseminacoes/domain/calculos";

export type SituacaoMatriz = "prenhe" | "pendente" | "vazia" | "sem";

export type InseminacaoResumoMatriz = {
  data: string;
  status: StatusInseminacao;
  numeroTentativa: number;
};

function chaveOrdenacao(item: InseminacaoResumoMatriz): number {
  const [y, m, d] = item.data.split("-").map(Number);
  const dataMs = Date.UTC(y, m - 1, d);
  return dataMs * 1000 + item.numeroTentativa;
}

export function ordenarLinhaDoTempo<T extends InseminacaoResumoMatriz>(
  historico: T[],
): T[] {
  return [...historico].sort(
    (a, b) => chaveOrdenacao(b) - chaveOrdenacao(a),
  );
}

export function derivarSituacaoDaUltimaInseminacao(
  historico: InseminacaoResumoMatriz[],
): { situacao: SituacaoMatriz; ultimaInseminacaoIso: string | null } {
  if (historico.length === 0) {
    return { situacao: "sem", ultimaInseminacaoIso: null };
  }
  const ultima = ordenarLinhaDoTempo(historico)[0];
  return {
    situacao: ultima.status,
    ultimaInseminacaoIso: ultima.data,
  };
}

export function formatarDataIsoParaBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

export function contarRepeticoesMatriz(historico: InseminacaoResumoMatriz[]): number {
  return contarRepeticoes(
    historico.map((h) => ({
      numeroTentativa: h.numeroTentativa,
      status: h.status,
    })),
  );
}