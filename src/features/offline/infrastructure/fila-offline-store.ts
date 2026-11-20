import {
  STORAGE_KEY,
  type ItemFilaOffline,
  enfileirarItem,
  lerFilaDoStorage,
  ordenarFila,
  removerItem,
  serializarFila,
} from "../domain/fila-offline";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function listarFilaOffline(): ItemFilaOffline[] {
  const s = storage();
  if (!s) return [];
  return lerFilaDoStorage(s.getItem(STORAGE_KEY));
}

export function salvarFilaOffline(itens: ItemFilaOffline[]): void {
  const s = storage();
  if (!s) return;
  s.setItem(STORAGE_KEY, serializarFila(itens));
}

export function notificarMudancaFila(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("inseminaai-fila-offline"));
  }
}

export function adicionarAFilaOffline(
  item: Omit<ItemFilaOffline, "criadoEm">,
): ItemFilaOffline[] {
  const atualizada = enfileirarItem(listarFilaOffline(), item);
  salvarFilaOffline(atualizada);
  notificarMudancaFila();
  return atualizada;
}

export function removerDaFilaOffline(id: string): ItemFilaOffline[] {
  const atualizada = removerItem(listarFilaOffline(), id);
  salvarFilaOffline(atualizada);
  notificarMudancaFila();
  return atualizada;
}

export function quantidadeNaFila(): number {
  return listarFilaOffline().length;
}

export function substituirFila(itens: ItemFilaOffline[]): void {
  salvarFilaOffline(ordenarFila(itens));
}