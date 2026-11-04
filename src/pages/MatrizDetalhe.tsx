import { Link, useParams } from "react-router-dom";
import { AppShell, Botao, CabecalhoVoltar, Cartao, Etiqueta, Vazio } from "../components/ui";
import { historicoDaMatriz, matrizes } from "../data/mock";

export function MatrizDetalhe() {
  const { id } = useParams();
  const matriz = matrizes.find((m) => m.id === id);
  const historico = id ? historicoDaMatriz(id) : [];

  if (!matriz) {
    return (
      <AppShell semBarra>
        <CabecalhoVoltar titulo="Matriz" voltar="/matrizes" />
        <Vazio titulo="Matriz não encontrada" texto="Volte à lista e escolha outro animal." />
      </AppShell>
    );
  }

  const pendente = historico.find((h) => h.status === "pendente");

  return (
    <AppShell semBarra>
      <CabecalhoVoltar titulo={matriz.nome} voltar="/matrizes" />
      <div className="px-4 pb-8 pt-4">
        <Cartao className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xl font-semibold">{matriz.nome}</p>
              <p className="text-sm text-muted-foreground">Brinco #{matriz.brinco}</p>
              {matriz.raca && (
                <p className="mt-1 text-sm text-muted-foreground">{matriz.raca}</p>
              )}
            </div>
            <Etiqueta situacao={matriz.situacao} />
          </div>
        </Cartao>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {pendente ? (
            <Link to={`/matrizes/${matriz.id}/diagnostico`} className="contents">
              <Botao className="min-h-12 text-sm">Registrar diagnóstico</Botao>
            </Link>
          ) : (
            <div />
          )}
          <Link to="/nova-inseminacao" className="contents">
            <Botao variante="suave" className="min-h-12 text-sm">
              Nova inseminação
            </Botao>
          </Link>
        </div>
        {!pendente && (
          <Link to="/nova-inseminacao" className="mt-3 block">
            <Botao className="min-h-12 text-sm">Nova inseminação</Botao>
          </Link>
        )}

        <h2 className="mb-3 mt-6 text-base font-semibold">Linha do tempo</h2>
        {historico.length === 0 ? (
          <Vazio titulo="Sem registro" texto="Ainda não há inseminações para esta matriz." />
        ) : (
          <Cartao className="divide-y divide-border p-0">
            {historico.map((item) => (
              <div key={item.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">
                    Tentativa {item.numeroTentativa} · {item.tipo}
                  </p>
                  <Etiqueta
                    situacao={
                      item.status === "pendente"
                        ? "pendente"
                        : item.status === "prenhe"
                          ? "prenhe"
                          : "vazia"
                    }
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.data} · {item.reprodutor} · {item.inseminador}
                </p>
                {item.previsaoParto && item.previsaoParto !== "não calculada" && (
                  <p className="mt-1 text-xs font-medium text-primary">
                    Parto previsto {item.previsaoParto}
                  </p>
                )}
                {item.dataDiagnosticoPrevista && (
                  <p className="mt-1 text-xs text-status-pendente">
                    Diagnóstico previsto {item.dataDiagnosticoPrevista}
                  </p>
                )}
              </div>
            ))}
          </Cartao>
        )}
      </div>
    </AppShell>
  );
}
