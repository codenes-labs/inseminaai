import { useCallback, useEffect, useRef, useState } from "react";
import { quantidadeNaFila } from "../infrastructure/fila-offline-store";
import { sincronizarFilaOffline } from "../infrastructure/sincronizar-fila";

export function usarSincronizacaoOffline(): {
  pendentes: number;
  sincronizar: () => Promise<void>;
  sincronizando: boolean;
} {
  const [pendentes, setPendentes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const emSync = useRef(false);

  const atualizarContagem = useCallback(() => {
    setPendentes(quantidadeNaFila());
  }, []);

  const sincronizar = useCallback(async () => {
    if (emSync.current) return;
    emSync.current = true;
    setSincronizando(true);
    try {
      await sincronizarFilaOffline();
    } finally {
      atualizarContagem();
      setSincronizando(false);
      emSync.current = false;
    }
  }, [atualizarContagem]);

  useEffect(() => {
    atualizarContagem();
    const aoOnline = () => void sincronizar();
    const aoFila = () => atualizarContagem();
    window.addEventListener("online", aoOnline);
    window.addEventListener("inseminaai-fila-offline", aoFila);
    if (navigator.onLine) void sincronizar();
    return () => {
      window.removeEventListener("online", aoOnline);
      window.removeEventListener("inseminaai-fila-offline", aoFila);
    };
  }, [atualizarContagem, sincronizar]);

  return { pendentes, sincronizar, sincronizando };
}