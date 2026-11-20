import { CloudOff, RefreshCw } from "lucide-react";
import { usarSincronizacaoOffline } from "../features/offline/presentation/usar-sincronizacao-offline";
import { cx } from "./ui";

export function AvisoFilaOffline() {
  const { pendentes, sincronizar, sincronizando } = usarSincronizacaoOffline();

  if (pendentes === 0) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-status-pendente/30 bg-warning-soft px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <CloudOff className="size-5 shrink-0 text-status-pendente" />
        <p className="min-w-0 flex-1">
          {pendentes === 1
            ? "1 registro aguardando internet"
            : `${pendentes} registros aguardando internet`}
        </p>
        <button
          type="button"
          disabled={sincronizando || !navigator.onLine}
          onClick={() => void sincronizar()}
          className={cx(
            "press flex min-h-10 shrink-0 items-center gap-1 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground",
            (sincronizando || !navigator.onLine) && "opacity-60",
          )}
        >
          <RefreshCw
            className={cx("size-4", sincronizando && "animate-spin")}
          />
          Enviar
        </button>
      </div>
    </div>
  );
}