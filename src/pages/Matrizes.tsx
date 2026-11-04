import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import {
  AppShell,
  AvatarLetra,
  Cartao,
  Etiqueta,
  Vazio,
  cx,
} from "../components/ui";
import { matrizes, type Situacao } from "../data/mock";

const filtros: { id: "todas" | Situacao; rotulo: string }[] = [
  { id: "todas", rotulo: "Todas" },
  { id: "prenhe", rotulo: "Prenhes" },
  { id: "pendente", rotulo: "Pendentes" },
  { id: "vazia", rotulo: "Vazias" },
];

export function Matrizes() {
  const [filtro, setFiltro] = useState<"todas" | Situacao>("todas");
  const [busca, setBusca] = useState("");

  const lista = useMemo(
    () =>
      matrizes.filter(
        (m) =>
          (filtro === "todas" || m.situacao === filtro) &&
          (m.nome.toLowerCase().includes(busca.toLowerCase()) ||
            m.brinco.includes(busca)),
      ),
    [filtro, busca],
  );

  return (
    <AppShell>
      <header className="sticky top-0 z-20 bg-primary px-4 pb-4 pt-5 text-primary-foreground">
        <h1 className="text-xl font-semibold">Matrizes</h1>
        <p className="text-sm opacity-80">{matrizes.length} animais cadastrados</p>
        <div className="mt-4 flex min-h-12 items-center gap-2.5 rounded-md bg-card px-3.5 text-foreground">
          <Search className="size-5 text-muted-foreground" strokeWidth={1.75} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou brinco"
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>
      <div className="flex gap-2 overflow-x-auto px-4 py-4">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={cx(
              "press min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold",
              filtro === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-brand-soft text-primary",
            )}
          >
            {f.rotulo}
          </button>
        ))}
      </div>
      <div className="space-y-2.5 px-4">
        {lista.map((matriz) => (
          <Link key={matriz.id} to={`/matrizes/${matriz.id}`}>
            <Cartao className="press flex items-center gap-3 p-3.5">
              <AvatarLetra nome={matriz.nome} situacao={matriz.situacao} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {matriz.nome}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    #{matriz.brinco}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {matriz.ultimaInseminacao
                    ? `Última IA: ${matriz.ultimaInseminacao}`
                    : "Nenhuma inseminação"}
                </p>
              </div>
              <Etiqueta situacao={matriz.situacao} />
              <ChevronRight className="size-4 text-muted-foreground" />
            </Cartao>
          </Link>
        ))}
        {lista.length === 0 && (
          <Vazio
            titulo="Nenhuma matriz por aqui"
            texto="Tente outro filtro ou ajuste a busca."
          />
        )}
      </div>
    </AppShell>
  );
}
