import { useNavigate } from "react-router-dom";
import { AppShell, Botao, Cartao } from "../components/ui";
import { lerSessao, sair } from "../lib/auth";
import { inseminadores, lotes, reprodutores } from "../data/mock";

export function Mais() {
  const navigate = useNavigate();
  const sessao = lerSessao();

  function encerrar() {
    sair();
    navigate("/");
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
        <h1 className="text-lg font-semibold">Mais</h1>
      </header>
      <div className="space-y-3 px-4 py-4">
        <Cartao className="p-4">
          <p className="text-sm text-muted-foreground">Conectado como</p>
          <p className="text-lg font-semibold">{sessao?.nome ?? "Vitor"}</p>
          <p className="text-sm text-muted-foreground">{sessao?.identificador}</p>
        </Cartao>
        <Cartao className="p-4">
          <p className="font-semibold">Cadastros</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Reprodutores: {reprodutores.join(", ")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Inseminadores: {inseminadores.join(", ")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Lotes: {lotes.join(", ")}</p>
        </Cartao>
        <Botao variante="suave" onClick={encerrar}>
          Sair
        </Botao>
      </div>
    </AppShell>
  );
}
