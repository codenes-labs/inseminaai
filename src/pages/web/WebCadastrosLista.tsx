import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, Star, X } from "lucide-react";
import { Botao, Cartao, cx, inputClass } from "../../components/ui";
import { desativarModoAppPlataforma } from "../../domain/auth/plataforma-modo-app";
import {
  cadastroEhFavoritoPlataforma,
  filtrarCadastrosPlataformaPorBusca,
  LISTAGEM_CADASTROS_PAGINA_TABELA,
  ordenarCadastrosPlataforma,
  paginaSlice,
  totalPaginasListagem,
} from "../../features/plataforma/domain/listagem-cadastros-plataforma";
import type { CadastroPlataforma } from "../../features/plataforma/infrastructure/plataforma-api";
import type { WebCadastrosLayoutContext } from "./WebCadastrosLayout";

/** Plus em SVG fixo — evita distorção do ícone com `press`/scale no pai. */
function IconeNovoCadastro({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function rotuloTipo(tipo: string) {
  return tipo === "empresa" ? "Empresa" : "Autônomo";
}

function rotuloStatus(ativa: boolean) {
  return ativa ? "Ativo" : "Inativo";
}

function LinhaCadastroNumerada({
  item,
  numero,
  onAbrir,
}: {
  item: CadastroPlataforma;
  numero: number;
  onAbrir: () => void;
}) {
  const favorito = cadastroEhFavoritoPlataforma(item.id);
  return (
    <li>
      <button
        type="button"
        onClick={onAbrir}
        className="press grid w-full grid-cols-[2rem_minmax(0,1fr)_5.25rem_minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 md:grid-cols-[2rem_minmax(8rem,1.25fr)_5.25rem_minmax(10rem,1fr)_auto]"
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground"
          aria-hidden
        >
          {numero}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          {favorito ? (
            <Star
              className="size-4 shrink-0 fill-amber-400 text-amber-500"
              aria-label="Favorito do sistema"
            />
          ) : null}
          <span className="truncate font-semibold">{item.nome}</span>
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {rotuloTipo(item.tipo)}
        </span>
        <span className="min-w-0 truncate text-xs text-muted-foreground">
          {item.emailLogin || "—"}
        </span>
        <span
          className={cx(
            "inline-flex h-6 min-w-[4.5rem] shrink-0 items-center justify-center justify-self-end rounded-full px-2 py-0 text-xs font-semibold leading-none",
            item.ativa
              ? "bg-primary/15 text-primary"
              : "bg-danger-soft text-status-vazia",
          )}
        >
          {rotuloStatus(item.ativa)}
        </span>
      </button>
    </li>
  );
}

export function WebCadastrosLista() {
  const navigate = useNavigate();
  const { lista, erroLista } = useOutletContext<WebCadastrosLayoutContext>();
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const listaTratada = useMemo(() => {
    const ordenada = ordenarCadastrosPlataforma(lista);
    return filtrarCadastrosPlataformaPorBusca(ordenada, busca);
  }, [lista, busca]);

  const totalPaginas = totalPaginasListagem(
    listaTratada.length,
    LISTAGEM_CADASTROS_PAGINA_TABELA,
  );

  const itensPagina = useMemo(
    () => paginaSlice(listaTratada, pagina, LISTAGEM_CADASTROS_PAGINA_TABELA),
    [listaTratada, pagina],
  );

  const inicioNumeracao = (pagina - 1) * LISTAGEM_CADASTROS_PAGINA_TABELA + 1;

  useEffect(() => {
    setPagina(1);
  }, [busca, listaTratada.length]);

  useEffect(() => {
    if (pagina > totalPaginas) {
      setPagina(totalPaginas);
    }
  }, [pagina, totalPaginas]);

  function abrirCadastro(cadastroId: string) {
    desativarModoAppPlataforma();
    navigate(`/admin/cadastros/${cadastroId}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            role="searchbox"
            className={cx(inputClass, "pl-9", busca.trim() && "pr-9")}
            placeholder="Buscar por nome ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar cadastro"
          />
          {busca.trim() ? (
            <button
              type="button"
              className="press absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-lg border border-border bg-brand-soft px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 sm:self-center"
          onClick={() => {
            desativarModoAppPlataforma();
            navigate("/admin/cadastros/novo");
          }}
        >
          <IconeNovoCadastro className="size-4 shrink-0 overflow-visible" />
          Novo cadastro
        </button>
      </div>

      {erroLista ? (
        <p className="text-sm text-status-vazia">{erroLista}</p>
      ) : null}

      {listaTratada.length === 0 ? (
        <Cartao className="p-8 text-center text-muted-foreground">
          {busca.trim() ? "Nenhum cadastro nesta busca." : "Nenhum cadastro ainda."}
        </Cartao>
      ) : (
        <Cartao className="overflow-hidden p-0">
          <ol className="divide-y divide-border" start={inicioNumeracao}>
            {itensPagina.map((item, indice) => (
              <LinhaCadastroNumerada
                key={item.id}
                item={item}
                numero={inicioNumeracao + indice}
                onAbrir={() => abrirCadastro(item.id)}
              />
            ))}
          </ol>
          {totalPaginas > 1 ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Página {pagina} de {totalPaginas} ({listaTratada.length} cadastros)
              </p>
              <div className="flex gap-2">
                <Botao
                  type="button"
                  variante="suave"
                  className="min-h-9 px-2"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Anterior
                </Botao>
                <Botao
                  type="button"
                  variante="suave"
                  className="min-h-9 px-2"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                >
                  Próxima
                  <ChevronRight className="size-4" />
                </Botao>
              </div>
            </div>
          ) : null}
        </Cartao>
      )}
    </div>
  );
}