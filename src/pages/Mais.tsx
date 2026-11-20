import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AppShell, Botao, Cartao } from "../components/ui";
import { lerSessao, sair } from "../lib/auth";

const linksCadastro = [
  { to: "/mais/reprodutores", rotulo: "Reprodutores" },
  { to: "/mais/inseminadores", rotulo: "Inseminadores" },
  { to: "/mais/lotes", rotulo: "Lotes" },
  { to: "/mais/importar", rotulo: "Importar planilha (CSV)" },
] as const;

export function Mais() {
  const navigate = useNavigate();
  const sessao = lerSessao();

  function encerrar() {
    sair();
    navigate("/entrar");
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
        <h1 className="text-lg font-semibold">Mais</h1>
      </header>
      <div className="space-y-3 px-4 py-4">
        <Cartao className="p-4">
          <p className="text-sm text-muted-foreground">Conectado como</p>
          <p className="text-lg font-semibold">{sessao?.nome ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{sessao?.identificador}</p>
        </Cartao>
        <Cartao className="divide-y divide-border p-0">
          <p className="px-4 pb-2 pt-4 font-semibold">Cadastros auxiliares</p>
          {linksCadastro.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="press flex min-h-12 items-center justify-between px-4 text-foreground"
            >
              <span className="font-medium">{link.rotulo}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </Cartao>
        <Botao variante="suave" onClick={encerrar}>
          Sair
        </Botao>
      </div>
    </AppShell>
  );
}