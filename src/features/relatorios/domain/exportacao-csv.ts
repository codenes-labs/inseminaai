export const CABECALHO_EXPORTACAO_CSV =
  "matriz;brinco;reprodutor;inseminador;data;tipo;lote";

export type LinhaExportacaoInseminacao = {
  matriz: string;
  brinco: string;
  reprodutor: string;
  inseminador: string;
  data: string;
  tipo: string;
  lote: string;
};

function escaparCampoCsv(valor: string): string {
  if (valor.includes(";") || valor.includes('"') || valor.includes("\n")) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export function formatarLinhaExportacaoCsv(linha: LinhaExportacaoInseminacao): string {
  return [
    linha.matriz,
    linha.brinco,
    linha.reprodutor,
    linha.inseminador,
    linha.data,
    linha.tipo,
    linha.lote,
  ]
    .map(escaparCampoCsv)
    .join(";");
}

export function montarCsvInseminacoes(linhas: LinhaExportacaoInseminacao[]): string {
  const corpo = linhas.map(formatarLinhaExportacaoCsv).join("\n");
  return `${CABECALHO_EXPORTACAO_CSV}\n${corpo}\n`;
}

export function formatarDataIsoParaBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

export function mapTipoInseminacaoParaExportacao(tipo: string): string {
  if (tipo === "PROTOCOLO") return "Protocolo";
  return tipo;
}