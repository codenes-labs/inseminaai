import { apiFetch } from "../../../lib/api-client";
import { deveManterNaFila } from "../domain/fila-offline";
import {
  listarFilaOffline,
  notificarMudancaFila,
  removerDaFilaOffline,
} from "./fila-offline-store";

export type ResultadoSincronizacao = {
  enviados: number;
  pendentes: number;
  parouEm?: string;
};

export async function sincronizarFilaOffline(): Promise<ResultadoSincronizacao> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const pendentes = listarFilaOffline().length;
    return { enviados: 0, pendentes };
  }

  const fila = listarFilaOffline();
  let enviados = 0;

  for (const item of fila) {
    try {
      const response = await apiFetch(item.caminho, {
        method: item.metodo,
        body: item.corpo,
      });
      if (deveManterNaFila(response.status)) {
        return {
          enviados,
          pendentes: fila.length - enviados,
          parouEm: item.id,
        };
      }
      removerDaFilaOffline(item.id);
      enviados++;
    } catch {
      return {
        enviados,
        pendentes: fila.length - enviados,
        parouEm: item.id,
      };
    }
  }

  notificarMudancaFila();
  return { enviados, pendentes: 0 };
}

export function deveEnfileirarOffline(erro: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  return erro instanceof TypeError;
}

export class OfflineEnfileiradoError extends Error {
  constructor() {
    super("Salvo no aparelho. Sincroniza quando houver internet.");
    this.name = "OfflineEnfileiradoError";
  }
}