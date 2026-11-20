export type GrupoTaxa = {
  chave: string;
  prenhes: number;
  diagnosticadas: number;
  taxaPercentual: number;
};

export function calcularTaxaPrenhez(prenhes: number, diagnosticadas: number): number {
  if (diagnosticadas <= 0) return 0;
  return Math.round((prenhes / diagnosticadas) * 100);
}

export function agruparTaxaPrenhez(
  itens: { grupo: string; prenhe: boolean; diagnosticada: boolean }[],
): GrupoTaxa[] {
  const mapa = new Map<string, { prenhes: number; diagnosticadas: number }>();

  for (const item of itens) {
    if (!item.diagnosticada) continue;
    const atual = mapa.get(item.grupo) ?? { prenhes: 0, diagnosticadas: 0 };
    atual.diagnosticadas++;
    if (item.prenhe) atual.prenhes++;
    mapa.set(item.grupo, atual);
  }

  return [...mapa.entries()]
    .map(([chave, totais]) => ({
      chave,
      prenhes: totais.prenhes,
      diagnosticadas: totais.diagnosticadas,
      taxaPercentual: calcularTaxaPrenhez(totais.prenhes, totais.diagnosticadas),
    }))
    .sort((a, b) => a.chave.localeCompare(b.chave, "pt-BR"));
}

export function mediaRepeticoesPorMatriz(
  tentativasMaximas: number[],
): number {
  if (tentativasMaximas.length === 0) return 0;
  const soma = tentativasMaximas.reduce(
    (acc, max) => acc + Math.max(0, max - 1),
    0,
  );
  return Math.round((soma / tentativasMaximas.length) * 10) / 10;
}