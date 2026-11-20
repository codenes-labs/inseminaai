import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AppShell,
  Botao,
  CabecalhoVoltar,
  Cartao,
  Etiqueta,
  TituloSecao,
  Vazio,
} from "../components/ui";
import { contextoMatrizInseminacaoApi } from "../features/inseminacoes/infrastructure/inseminacoes-api";
import {
  atualizarMatrizApi,
  historicoMatrizApi,
  obterMatrizApi,
  type HistoricoInseminacao,
  type MatrizLista,
} from "../features/matrizes/infrastructure/matrizes-api";

export function MatrizDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matriz, setMatriz] = useState<MatrizLista | null | undefined>(undefined);
  const [temPendente, setTemPendente] = useState(false);
  const [historico, setHistorico] = useState<HistoricoInseminacao[]>([]);
  const [repeticoes, setRepeticoes] = useState(0);
  const [desativando, setDesativando] = useState(false);
  const [reativando, setReativando] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    void (async () => {
      try {
        const [dados, ctx, linha] = await Promise.all([
          obterMatrizApi(id),
          contextoMatrizInseminacaoApi(id),
          historicoMatrizApi(id),
        ]);
        if (ativo) {
          setMatriz(dados);
          setTemPendente(ctx.temPendente);
          setHistorico(linha.historico);
          setRepeticoes(linha.repeticoes);
        }
      } catch {
        if (ativo) setMatriz(null);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  async function desativar() {
    if (!id || !matriz) return;
    setDesativando(true);
    try {
      await atualizarMatrizApi(id, { ativa: false });
      navigate("/matrizes", { state: { abrirInativas: true } });
    } catch {
      setDesativando(false);
    }
  }

  async function reativar() {
    if (!id || !matriz) return;
    setReativando(true);
    try {
      const atualizada = await atualizarMatrizApi(id, { ativa: true });
      setMatriz(atualizada);
    } catch {
      setReativando(false);
    }
  }

  if (matriz === undefined) {
    return (
      <AppShell semBarra>
        <CabecalhoVoltar titulo="Matriz" voltar="/matrizes" />
        <p className="px-4 py-6 text-sm text-muted-foreground">Carregando…</p>
      </AppShell>
    );
  }

  if (!matriz) {
    return (
      <AppShell semBarra>
        <CabecalhoVoltar titulo="Matriz" voltar="/matrizes" />
        <Vazio titulo="Matriz não encontrada" texto="Volte à lista e escolha outro animal." />
      </AppShell>
    );
  }

  return (
    <AppShell semBarra>
      <CabecalhoVoltar titulo={matriz.nome} voltar="/matrizes" />
      <div className="px-4 pb-8 pt-4">
        <Cartao className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xl font-semibold">{matriz.nome}</p>
              {matriz.brinco && (
                <p className="text-sm text-muted-foreground">Brinco #{matriz.brinco}</p>
              )}
              {matriz.raca && (
                <p className="mt-1 text-sm text-muted-foreground">{matriz.raca}</p>
              )}
            </div>
            <Etiqueta situacao={matriz.ativa ? matriz.situacao : "sem"} />
          </div>
          {!matriz.ativa && (
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Matriz desativada — não aparece em novas inseminações.
            </p>
          )}
        </Cartao>

        <div className="mt-4 flex flex-col gap-2">
          <Link to={`/matrizes/${matriz.id}/editar`}>
            <Botao variante="suave">Editar cadastro</Botao>
          </Link>
          {matriz.ativa ? (
            <Botao
              variante="suave"
              disabled={desativando}
              onClick={() => void desativar()}
            >
              {desativando ? "Desativando…" : "Desativar matriz"}
            </Botao>
          ) : (
            <Botao
              variante="suave"
              disabled={reativando}
              onClick={() => void reativar()}
            >
              {reativando ? "Reativando…" : "Reativar matriz"}
            </Botao>
          )}
        </div>

        {matriz.ativa && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {temPendente ? (
              <Link to={`/matrizes/${matriz.id}/diagnostico`} className="contents">
                <Botao className="col-span-2">Registrar diagnóstico</Botao>
              </Link>
            ) : (
              <Link to="/nova-inseminacao" state={{ matrizId: matriz.id }} className="col-span-2">
                <Botao className="w-full">Nova inseminação</Botao>
              </Link>
            )}
          </div>
        )}

        <section className="mt-8">
          <TituloSecao>
            Linha do tempo
            {repeticoes > 0 ? ` · ${repeticoes} repetição${repeticoes > 1 ? "ões" : ""}` : ""}
          </TituloSecao>
          {historico.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhuma inseminação registrada para esta matriz.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {historico.map((item) => (
                <li key={item.id}>
                  <Cartao className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">
                        {item.data} · {item.tipo}
                      </p>
                      <Etiqueta situacao={item.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tentativa {item.numeroTentativa}
                      {item.numeroTentativa > 1 ? " (repetição)" : ""}
                    </p>
                    <p className="mt-1 text-sm">
                      {item.reprodutor} · {item.inseminador}
                    </p>
                    {item.lote && (
                      <p className="text-sm text-muted-foreground">{item.lote}</p>
                    )}
                    {item.dataDiagnosticoPrevista && item.status === "pendente" && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Diagnóstico previsto: {item.dataDiagnosticoPrevista}
                      </p>
                    )}
                    {item.previsaoParto && item.status === "prenhe" && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Parto previsto: {item.previsaoParto}
                      </p>
                    )}
                    {item.observacoes && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.observacoes}
                      </p>
                    )}
                  </Cartao>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}