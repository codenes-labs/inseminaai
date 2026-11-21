import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ativarModoAppPlataforma } from "../../domain/auth/plataforma-modo-app";
import { Logo } from "../../components/ui";
import { lerSessao, sair } from "../../lib/auth";

export function WebShell({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  const sessao = lerSessao();
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Logo />
          <nav className="flex items-center gap-4 text-sm font-medium">
            {sessao?.plataformaAdmin ? (
              <>
                <Link to="/admin/cadastros" className="text-primary">
                  Cadastros
                </Link>
                <Link
                  to="/inicio"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => ativarModoAppPlataforma()}
                >
                  App mobile
                </Link>
              </>
            ) : null}
            <button
              type="button"
              className="press text-muted-foreground hover:text-foreground"
              onClick={() => {
                sair();
                window.location.href = "/admin/entrar";
              }}
            >
              Sair
            </button>
          </nav>
        </div>
        {titulo ? (
          <h1 className="mx-auto mt-4 max-w-5xl text-2xl font-semibold">{titulo}</h1>
        ) : null}
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}