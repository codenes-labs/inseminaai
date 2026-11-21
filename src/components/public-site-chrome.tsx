import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import type { ThemeMode } from "../domain/theme/theme-mode";
import { useTheme } from "./theme";
import { Logo } from "./ui";

function HeaderActions({
  themeLabel,
  mode,
  toggle,
}: {
  themeLabel: string;
  mode: ThemeMode;
  toggle: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <button
        type="button"
        className="press inline-flex size-12 items-center justify-center rounded-lg text-muted-foreground"
        onClick={toggle}
        aria-label={themeLabel}
        title={themeLabel}
      >
        {mode === "dark" ? (
          <Sun className="size-5" aria-hidden />
        ) : (
          <Moon className="size-5" aria-hidden />
        )}
      </button>
      <Link
        to="/entrar"
        className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground"
      >
        Entrar
      </Link>
    </div>
  );
}

export function PublicSiteChrome({ children }: { children: ReactNode }) {
  const { mode, toggle } = useTheme();
  const themeLabel = mode === "dark" ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <div className="mx-auto min-h-dvh w-full min-w-0 max-w-[1080px] overflow-x-clip px-4 py-5 sm:px-8">
      <header className="flex w-full min-w-0 items-center justify-between gap-2">
        <Link to="/" className="inline-flex min-w-0 max-w-full" aria-label="Insemina aí">
          <Logo />
        </Link>
        <HeaderActions themeLabel={themeLabel} mode={mode} toggle={toggle} />
      </header>
      {children}
      <PublicSiteFooter />
    </div>
  );
}

export function PublicSiteFooter() {
  return (
    <footer className="mt-12 shrink-0 border-t border-border pt-8 text-sm text-muted-foreground">
      <p>
        Insemina aí. App para registro de inseminações, diagnósticos e repetições de matrizes
        bovinas — uso no campo, pelo celular.
      </p>
      <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1" aria-label="Links institucionais">
        <Link to="/termos" className="font-semibold text-primary">
          Termos de uso
        </Link>
        <Link to="/privacidade" className="font-semibold text-primary">
          Privacidade
        </Link>
        <Link to="/docs" className="font-semibold text-primary">
          Documentação
        </Link>
        <Link to="/admin/cadastros" className="font-semibold text-primary">
          Administração da plataforma
        </Link>
      </nav>
    </footer>
  );
}