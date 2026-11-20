export type MetodoFila = "POST" | "PATCH";

export type TipoOperacaoOffline =
  | "inseminacao"
  | "inseminacao_lote"
  | "diagnostico";

export type ItemFilaOffline = {
  id: string;
  criadoEm: number;
  metodo: MetodoFila;
  caminho: string;
  corpo: string;
  tipo: TipoOperacaoOffline;
};

const STORAGE_KEY = "inseminaai_fila_offline_v1";

export function ordenarFila(itens: ItemFilaOffline[]): ItemFilaOffline[] {
  return [...itens].sort((a, b) => a.criadoEm - b.criadoEm);
}

export function enfileirarItem(
  itens: ItemFilaOffline[],
  item: Omit<ItemFilaOffline, "criadoEm"> & { criadoEm?: number },
): ItemFilaOffline[] {
  const novo: ItemFilaOffline = {
    ...item,
    criadoEm: item.criadoEm ?? Date.now(),
  };
  return ordenarFila([...itens, novo]);
}

export function removerItem(
  itens: ItemFilaOffline[],
  id: string,
): ItemFilaOffline[] {
  return itens.filter((i) => i.id !== id);
}

export function deveManterNaFila(statusHttp: number): boolean {
  if (statusHttp >= 200 && statusHttp < 300) return false;
  if (statusHttp === 401 || statusHttp === 403) return true;
  if (statusHttp === 409) return true;
  return statusHttp >= 400;
}

export function lerFilaDoStorage(raw: string | null): ItemFilaOffline[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ItemFilaOffline[];
    return Array.isArray(parsed) ? ordenarFila(parsed) : [];
  } catch {
    return [];
  }
}

export function serializarFila(itens: ItemFilaOffline[]): string {
  return JSON.stringify(ordenarFila(itens));
}

export { STORAGE_KEY };