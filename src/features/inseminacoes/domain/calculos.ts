export type StatusInseminacao = "pendente" | "prenhe" | "vazia";

export type InseminacaoResumo = {
  numeroTentativa: number;
  status: StatusInseminacao;
};

function parseData(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatData(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function adicionarDias(iso: string, dias: number): string {
  const date = parseData(iso);
  date.setUTCDate(date.getUTCDate() + dias);
  return formatData(date);
}

export function calcularDataDiagnosticoPrevista(
  dataInseminacao: string,
  diasDiagnostico = 30,
): string {
  return adicionarDias(dataInseminacao, diasDiagnostico);
}

export function calcularPrevisaoParto(dataInseminacao: string, gestacaoDias = 283): string {
  return adicionarDias(dataInseminacao, gestacaoDias);
}

export function dataNaoFutura(data: string, hoje: string): boolean {
  return parseData(data).getTime() <= parseData(hoje).getTime();
}

export function dataDiagnosticoValida(dataInseminacao: string, dataDiagnostico: string): boolean {
  return parseData(dataDiagnostico).getTime() >= parseData(dataInseminacao).getTime();
}

export function calcularProximaTentativa(historico: InseminacaoResumo[]): number {
  if (historico.length === 0) return 1;
  const ordenado = [...historico].sort((a, b) => b.numeroTentativa - a.numeroTentativa);
  const ultima = ordenado[0];
  if (ultima.status === "vazia") return ultima.numeroTentativa + 1;
  return ultima.numeroTentativa;
}

export function contarRepeticoes(historico: InseminacaoResumo[]): number {
  if (historico.length === 0) return 0;
  const maxTentativa = Math.max(...historico.map((h) => h.numeroTentativa));
  return Math.max(0, maxTentativa - 1);
}

export function matrizComInseminacaoPendente(historico: InseminacaoResumo[]): boolean {
  return historico.some((h) => h.status === "pendente");
}
