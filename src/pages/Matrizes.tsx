import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus, Search } from "lucide-react";
import {
  AppShell,
  AvatarLetra,
  Cartao,
  Etiqueta,
  Vazio,
  cx,
} from "../components/ui";
import type { Situacao } from "../data/mock";
import { listarMatrizesApi } from "../features/matrizes/infrastructure/matrizes-api";

const filtros: { id: "todas" | Situacao; rotulo: string }[] = [
  { id: "todas", rotulo: "Todas" },
  { id: "prenhe", rotulo: "Prenhes" },
  { id: "pendente", rotulo: "Pendentes" },
  { id: "vazia", rotulo: "Vazias" },
];

export function Matrizes() {
  const [filtro, setFiltro] = useState<"todas" | Situacao>("todas");
  const [busca, setBusca] = useState("");
  const [matrizes, setMatrizes] = useState<Awaited<ReturnType<typeof listarMatrizesApi>>>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async (consulta: string) => {
    setCarregando(true);
    setErro("");
    try {
      const lista = await listarMatrizesApi(consulta);
      setMatrizes(lista);
    } catch {
      setErro("Não foi possível carregar. Verifique o login e o banco (make db-setup).");
      setMatrizes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void carregar(busca);
    }, 300);
    return () => window.clearTimeout(t);
  }, [busca, carregar]);

  const lista = useMemo(
    () =>
      matrizes.filter(
        (m) => filtro === "todas" || m.situacao === filtro,
      ),
    [matrizes, filtro],
  );

  return (
    <AppShell>
      <header className="sticky top-0 z-20 bg-primary px-4 pb-4 pt-5 text-primary-foreground">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Matrizes</h1>
            <p className="text-sm opacity-80">
              {carregando ? "Carregando…" : `${matrizes.length} animais ativos`}
            </p>
          </div>
          <Link
            to="/matrizes/nova"
            className="press flex size-12 items-center justify-center rounded-full bg-primary-foreground/15"
            aria-label="Nova matriz"
          >
            <Plus className="size-6" strokeWidth={2} />
          </Link>
        </div>
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
      {erro && (
        <p className="px-4 pt-3 text-sm font-medium text-status-vazia">{erro}</p>
      )}
      <div className="flex gap-2 overflow-x-auto px-4 py-4">
        {filtros.map((f) => (
          <button
            key={f.id}
            type="button"
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
                  {matriz.brinco && (
                    <span className="text-xs font-normal text-muted-foreground">
                      #{matriz.brinco}
                    </span>
                  )}
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
        {!carregando && lista.length === 0 && (
          <Vazio
            titulo="Nenhuma matriz por aqui"
            texto="Cadastre uma nova matriz ou ajuste a busca."
          />
        )}
      </div>
    </AppShell>
  );
}