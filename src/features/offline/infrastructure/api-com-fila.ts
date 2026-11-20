import { randomUUID } from "../domain/id";
import type { MetodoFila, TipoOperacaoOffline } from "../domain/fila-offline";
import { adicionarAFilaOffline } from "./fila-offline-store";
import { OfflineEnfileiradoError, deveEnfileirarOffline } from "./sincronizar-fila";
import { apiFetch } from "../../../lib/api-client";

export async function apiFetchComFilaOffline(
  caminho: string,
  init: RequestInit,
  tipo: TipoOperacaoOffline,
): Promise<Response> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    enfileirar(caminho, init, tipo);
    throw new OfflineEnfileiradoError();
  }
  try {
    return await apiFetch(caminho, init);
  } catch (erro) {
    if (deveEnfileirarOffline(erro)) {
      enfileirar(caminho, init, tipo);
      throw new OfflineEnfileiradoError();
    }
    throw erro;
  }
}

function enfileirar(
  caminho: string,
  init: RequestInit,
  tipo: TipoOperacaoOffline,
): void {
  const metodo = (init.method ?? "GET").toUpperCase();
  if (metodo !== "POST" && metodo !== "PATCH") return;
  adicionarAFilaOffline({
    id: randomUUID(),
    metodo: metodo as MetodoFila,
    caminho,
    corpo: typeof init.body === "string" ? init.body : "{}",
    tipo,
  });
}