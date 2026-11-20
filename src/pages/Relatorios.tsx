import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { AppShell, Botao, Cartao } from "../components/ui";
import {
  baixarCsvInseminacoes,
  obterResumoRelatoriosApi,
  type ResumoRelatoriosApi,
} from "../features/relatorios/infrastructure/relatorios-api";

function ListaTaxas({
  titulo,
  itens,
}: {
  titulo: string;
  itens: { chave: string; taxaPercentual: number; diagnosticadas: number }[];
}) {
  if (itens.length === 0) return null;
  return (
    <Cartao className="p-4">
      <p className="text-sm font-semibold">{titulo}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {itens.map((item) => (
          <li key={item.chave} className="flex items-center justify-between gap-2">
            <span className="truncate">{item.chave}</span>
            <span className="shrink-0 font-semibold text-primary">
              {item.taxaPercentual}%{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (n={item.diagnosticadas})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Cartao>
  );
}

export function Relatorios() {
  const [resumo, setResumo] = useState<ResumoRelatoriosApi | null>(null);
  const [erro, setErro] = useState("");
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    let ativo = true;
    void (async () => {
      try {
        const dados = await obterResumoRelatoriosApi();
        if (ativo) setResumo(dados);
      } catch {
        if (ativo) setErro("Não foi possível carregar.");
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  async function exportarCsv() {
    setExportando(true);
    setErro("");
    try {
      const blob = await baixarCsvInseminacoes();
      const arquivo = new File([blob], "inseminaai-inseminacoes.csv", {
        type: "text/csv",
      });
      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare?.({ files: [arquivo] })
      ) {
        await navigator.share({
          files: [arquivo],
          title: "Inseminações exportadas",
        });
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "inseminaai-inseminacoes.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
      setErro(
        cause instanceof Error ? cause.message : "Falha ao exportar o CSV.",
      );
    } finally {
      setExportando(false);
    }
  }

  const dados = resumo ?? {
    taxaPrenhezGeral: 0,
    prenhes: 0,
    diagnosticadas: 0,
    inseminadasMes: 0,
    pendentes: 0,
    porSituacao: { prenhe: 0, pendente: 0, vazia: 0, sem: 0 },
    taxaPorReprodutor: [],
    taxaPorTipo: [],
    taxaPorLote: [],
    mediaRepeticoes: 0,
  };

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
        <h1 className="text-lg font-semibold">Relatórios</h1>
      </header>
      <div className="space-y-3 px-4 py-4">
        {erro ? (
          <p className="text-sm font-medium text-status-vazia">{erro}</p>
        ) : null}
        <Cartao className="p-4">
          <p className="text-xs text-muted-foreground">Taxa de prenhez</p>
          <p className="mt-1 text-3xl font-semibold">
            {dados.taxaPrenhezGeral}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {dados.prenhes} prenhes em {dados.diagnosticadas} com diagnóstico
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Média de repetições por matriz:{" "}
            <span className="font-semibold text-foreground">
              {dados.mediaRepeticoes}
            </span>
          </p>
        </Cartao>
        <div className="grid grid-cols-2 gap-3">
          <Cartao className="p-4">
            <p className="text-xs text-muted-foreground">Inseminadas no mês</p>
            <p className="mt-1 text-2xl font-semibold">
              {dados.inseminadasMes}
            </p>
          </Cartao>
          <Cartao className="p-4">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="mt-1 text-2xl font-semibold">{dados.pendentes}</p>
          </Cartao>
        </div>
        <Cartao className="p-4">
          <p className="text-sm font-semibold">Por situação (matrizes ativas)</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Prenhe</span>
              <span className="font-semibold text-status-prenhe">
                {dados.porSituacao.prenhe}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Pendente</span>
              <span className="font-semibold text-status-pendente">
                {dados.porSituacao.pendente}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Vazia</span>
              <span className="font-semibold text-status-vazia">
                {dados.porSituacao.vazia}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Sem registro</span>
              <span className="font-semibold text-muted-foreground">
                {dados.porSituacao.sem}
              </span>
            </li>
          </ul>
        </Cartao>
        <ListaTaxas titulo="Taxa por reprodutor" itens={dados.taxaPorReprodutor} />
        <ListaTaxas titulo="Taxa por tipo" itens={dados.taxaPorTipo} />
        <ListaTaxas titulo="Taxa por lote" itens={dados.taxaPorLote} />
        <Botao
          type="button"
          variante="suave"
          disabled={exportando}
          onClick={() => void exportarCsv()}
        >
          <Download className="size-5" />
          {exportando ? "Gerando CSV…" : "Exportar inseminações (.csv)"}
        </Botao>
      </div>
    </AppShell>
  );
}