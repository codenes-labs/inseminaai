import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { AppShell, Botao, Cartao, Vazio } from "../components/ui";
import type { TipoCadastro } from "../features/cadastros-auxiliares/infrastructure/cadastros-auxiliares-api";
import {
  listarInseminadoresApi,
  listarLotesApi,
  listarReprodutoresApi,
} from "../features/cadastros-auxiliares/infrastructure/cadastros-auxiliares-api";

const rotulos: Record<TipoCadastro, string> = {
  reprodutores: "Reprodutores",
  inseminadores: "Inseminadores",
  lotes: "Lotes",
};

type ItemLista = {
  id: string;
  nome: string;
  ativo: boolean;
  detalhe?: string;
};

export function CadastroAuxiliarLista() {
  const { tipo: tipoParam } = useParams();
  const tipo = tipoParam as TipoCadastro | undefined;
  const [itens, setItens] = useState<ItemLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    if (!tipo || !rotulos[tipo]) return;
    setCarregando(true);
    setErro("");
    try {
      if (tipo === "reprodutores") {
        const lista = await listarReprodutoresApi(false);
        setItens(
          lista.map((r) => ({
            id: r.id,
            nome: r.nome,
            ativo: r.ativo,
            detalhe: r.raca ?? undefined,
          })),
        );
      } else if (tipo === "inseminadores") {
        const lista = await listarInseminadoresApi(false);
        setItens(lista.map((r) => ({ id: r.id, nome: r.nome, ativo: r.ativo })));
      } else {
        const lista = await listarLotesApi(false);
        setItens(
          lista.map((l) => ({
            id: l.id,
            nome: l.nome,
            ativo: l.ativo,
            detalhe: l.data_inicio,
          })),
        );
      }
    } catch {
      setErro("Não foi possível carregar. Verifique o banco.");
      setItens([]);
    } finally {
      setCarregando(false);
    }
  }, [tipo]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (!tipo || !rotulos[tipo]) {
    return (
      <AppShell semBarra>
        <Vazio titulo="Cadastro inválido" texto="Volte ao menu Mais." />
      </AppShell>
    );
  }

  const titulo = rotulos[tipo];
  const base = `/mais/${tipo}`;

  return (
    <AppShell semBarra>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
        <Link to="/mais" className="press -ml-2 text-sm font-medium opacity-90">
          ← Mais
        </Link>
        <h1 className="flex-1 text-lg font-semibold">{titulo}</h1>
        <Link
          to={`${base}/nova`}
          className="press flex size-10 items-center justify-center rounded-full bg-primary-foreground/15"
          aria-label={`Novo ${titulo.toLowerCase()}`}
        >
          <Plus className="size-5" />
        </Link>
      </header>
      <div className="px-4 py-4">
        <div className="space-y-2">
          {erro && (
            <p className="text-sm font-medium text-status-vazia">{erro}</p>
          )}
          {carregando && (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          )}
          {itens.map((item) => (
            <Link key={item.id} to={`${base}/${item.id}/editar`}>
              <Cartao className="press flex items-center gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.nome}</p>
                  {item.detalhe && (
                    <p className="text-xs text-muted-foreground">
                      {item.detalhe}
                    </p>
                  )}
                  {!item.ativo && (
                    <p className="text-xs text-status-vazia">Inativo</p>
                  )}
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Cartao>
            </Link>
          ))}
          {!carregando && itens.length === 0 && (
            <Vazio
              titulo={`Nenhum cadastro`}
              texto={`Toque em + para adicionar ${titulo.toLowerCase()}.`}
            />
          )}
        </div>
        <Link to="/mais" className="mt-6 block">
          <Botao variante="suave" className="w-full">
            Voltar
          </Botao>
        </Link>
      </div>
    </AppShell>
  );
}