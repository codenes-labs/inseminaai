import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  FileUp,
  KeyRound,
  Moon,
  Sun,
} from "lucide-react";
import { AppShell, Cartao, cx } from "../components/ui";
import { useTheme } from "../components/theme";

function LinkConfiguracao({
  to,
  rotulo,
  icone,
}: {
  to: string;
  rotulo: string;
  icone: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="press flex min-h-12 items-center justify-between gap-3 px-4 text-foreground"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="text-muted-foreground">{icone}</span>
        <span className="font-medium">{rotulo}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function Configuracoes() {
  const { mode, setMode } = useTheme();

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
        <Link to="/mais" className="press -ml-2 text-sm font-medium opacity-90">
          ← Mais
        </Link>
        <h1 className="text-lg font-semibold">Configurações</h1>
      </header>
      <div className="space-y-3 px-4 py-4">
        <Cartao className="space-y-3 p-4">
          <p className="text-sm font-semibold text-foreground">Aparência</p>
          <p className="text-sm text-muted-foreground">Tema do aplicativo</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={cx(
                "press flex min-h-14 items-center justify-center gap-2 rounded-md border text-base font-semibold",
                mode === "light"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
              onClick={() => setMode("light")}
            >
              <Sun className="size-5" />
              Claro
            </button>
            <button
              type="button"
              className={cx(
                "press flex min-h-14 items-center justify-center gap-2 rounded-md border text-base font-semibold",
                mode === "dark"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
              onClick={() => setMode("dark")}
            >
              <Moon className="size-5" />
              Escuro
            </button>
          </div>
        </Cartao>
        <Cartao className="divide-y divide-border p-0">
          <p className="px-4 pb-2 pt-4 text-sm font-semibold text-muted-foreground">
            Conta e dados
          </p>
          <LinkConfiguracao
            to="/mais/configuracoes/senha"
            rotulo="Alterar senha"
            icone={<KeyRound className="size-5" strokeWidth={1.75} />}
          />
          <LinkConfiguracao
            to="/mais/importar"
            rotulo="Importar planilha (CSV)"
            icone={<FileUp className="size-5" strokeWidth={1.75} />}
          />
        </Cartao>
      </div>
    </AppShell>
  );
}