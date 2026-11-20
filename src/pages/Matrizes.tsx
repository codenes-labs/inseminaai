import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Plus, Search } from "lucide-react";
import {
  AppShell,
  AvatarLetra,
  Cartao,
  Etiqueta,
  FiltroSelecao,
  Vazio,
  cx,
} from "../components/ui";
import type { Situacao } from "../data/mock";
import { listarMatrizesApi } from "../features/matrizes/infrastructure/matrizes-api";

type FiltroLista = "todas" | Situacao | "inativas";

const filtros: { id: FiltroLista; rotulo: string }[] = [
  { id: "todas", rotulo: "Todas" },
  { id: "prenhe", rotulo: "Prenhes" },
  { id: "pendente", rotulo: "Pendentes" },
  { id: "vazia", rotulo: "Vazias" },
  { id: "inativas", rotulo: "Desativadas" },
];

export function Matrizes() {
  const location = useLocation();
  const stateNav = location.state as {
    abrirInativas?: boolean;
    filtroInicial?: FiltroLista;
    apenasMatrizIds?: string[];
    contextoLista?: string;
  } | null;
  const abrirInativas = Boolean(stateNav?.abrirInativas);
  const filtroInicial = stateNav?.filtroInicial;
  const apenasMatrizIds = stateNav?.apenasMatrizIds;
  const contextoLista = stateNav?.contextoLista;
  const [filtro, setFiltro] = useState<FiltroLista>(() => {
    if (abrirInativas) return "inativas";
    if (
      filtroInicial &&
      filtros.some((f) => f.id === filtroInicial) &&
      filtroInicial !== "inativas"
    ) {
      return filtroInicial;
    }
    return "todas";
  });
  const [busca, setBusca] = useState("");
  const [matrizes, setMatrizes] = useState<Awaited<ReturnType<typeof listarMatrizesApi>>>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const listandoInativas = filtro === "inativas";

  const carregar = useCallback(async (consulta: string, inativas: boolean) => {
    setCarregando(true);
    setErro("");
    try {
      const lista = await listarMatrizesApi(consulta, {
        ativas: inativas ? false : true,
      });
      setMatrizes(lista);
    } catch {
      setErro(
        "Não foi possível carregar. Tente sair e entrar de novo; se persistir, confira o banco em produção.",
      );
      setMatrizes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void carregar(busca, listandoInativas);
    }, 300);
    return () => window.clearTimeout(t);
  }, [busca, carregar, listandoInativas]);

  const lista = useMemo(() => {
    let base = matrizes;
    if (filtro === "inativas") {
      base = matrizes;
    } else {
      base = matrizes.filter(
        (m) => filtro === "todas" || m.situacao === filtro,
      );
    }
    if (apenasMatrizIds?.length) {
      const ordem = new Map(apenasMatrizIds.map((id, indice) => [id, indice]));
      base = base
        .filter((m) => ordem.has(m.id))
        .sort((a, b) => (ordem.get(a.id) ?? 0) - (ordem.get(b.id) ?? 0));
    }
    return base;
  }, [matrizes, filtro, apenasMatrizIds]);

  return (
    <AppShell>
      <header className="sticky top-0 z-20 bg-primary px-4 pb-4 pt-5 text-primary-foreground">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Matrizes</h1>
            <p className="text-sm opacity-80">
              {carregando
                ? "Carregando…"
                : listandoInativas
                  ? `${matrizes.length} desativada${matrizes.length === 1 ? "" : "s"}`
                  : `${matrizes.length} animais ativos`}
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
      {contextoLista ? (
        <p className="px-4 pt-2 text-sm font-medium text-foreground">
          {contextoLista}
        </p>
      ) : null}
      <div className="px-4 py-3">
        <FiltroSelecao
          rotulo="Situação"
          valor={filtro}
          opcoes={filtros}
          onChange={setFiltro}
          valorLimpar="todas"
        />
      </div>
      <div className="space-y-2.5 px-4">
        {lista.map((matriz) => (
          <Link key={matriz.id} to={`/matrizes/${matriz.id}`}>
            <Cartao
              className={cx(
                "press flex items-center gap-3 p-3.5",
                listandoInativas && "opacity-80",
              )}
            >
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
            titulo={
              listandoInativas
                ? "Nenhuma matriz desativada"
                : "Nenhuma matriz por aqui"
            }
            texto={
              listandoInativas
                ? "As desativadas somem das listas de inseminação, mas continuam aqui."
                : "Cadastre uma nova matriz ou ajuste a busca."
            }
          />
        )}
      </div>
    </AppShell>
  );
}