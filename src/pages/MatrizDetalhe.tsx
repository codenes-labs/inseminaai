import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell, Botao, CabecalhoVoltar, Cartao, Etiqueta, Vazio } from "../components/ui";
import { historicoDaMatriz } from "../data/mock";
import { contextoMatrizInseminacaoApi } from "../features/inseminacoes/infrastructure/inseminacoes-api";
import {
  atualizarMatrizApi,
  obterMatrizApi,
  type MatrizLista,
} from "../features/matrizes/infrastructure/matrizes-api";

export function MatrizDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matriz, setMatriz] = useState<MatrizLista | null | undefined>(undefined);
  const [temPendente, setTemPendente] = useState(false);
  const [desativando, setDesativando] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    void (async () => {
      try {
        const [dados, ctx] = await Promise.all([
          obterMatrizApi(id),
          contextoMatrizInseminacaoApi(id),
        ]);
        if (ativo) {
          setMatriz(dados);
          setTemPendente(ctx.temPendente);
        }
      } catch {
        if (ativo) setMatriz(null);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  const historico = id ? historicoDaMatriz(id) : [];

  async function desativar() {
    if (!id || !matriz) return;
    setDesativando(true);
    try {
      await atualizarMatrizApi(id, { ativa: false });
      navigate("/matrizes");
    } catch {
      setDesativando(false);
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

  const pendenteMock = historico.find((h) => h.status === "pendente");
  const mostrarDiagnostico = temPendente || Boolean(pendenteMock);

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
            <Etiqueta situacao={matriz.situacao} />
          </div>
        </Cartao>

        <div className="mt-4 flex flex-col gap-2">
          <Link to={`/matrizes/${matriz.id}/editar`}>
            <Botao variante="suave">Editar cadastro</Botao>
          </Link>
          <Botao
            variante="suave"
            disabled={desativando}
            onClick={() => void desativar()}
          >
            {desativando ? "Desativando…" : "Desativar matriz"}
          </Botao>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {mostrarDiagnostico ? (
            <Link to={`/matrizes/${matriz.id}/diagnostico`} className="contents">
              <Botao className="col-span-2">Registrar diagnóstico</Botao>
            </Link>
          ) : (
            <Link to="/nova-inseminacao" className="col-span-2">
              <Botao className="w-full">Nova inseminação</Botao>
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}