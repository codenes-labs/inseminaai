import { useEffect, useMemo, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { AppShell, Botao, Cartao } from "../components/ui";
import {
  periodoMesDe,
  type PeriodoRelatorio,
} from "../features/relatorios/domain/periodo";
import { ComprovanteRelatorio } from "../features/relatorios/presentation/ComprovanteRelatorio";
import { RelatorioCompletoDocumento } from "../features/relatorios/presentation/RelatorioCompletoDocumento";
import { ExportarRelatoriosSheet } from "../features/relatorios/presentation/ExportarRelatoriosSheet";
import { PreviaRelatorioPdf } from "../features/relatorios/presentation/PreviaRelatorioPdf";
import { SeletorPeriodoRelatorio } from "../features/relatorios/presentation/SeletorPeriodoRelatorio";
import {
  baixarCsvInseminacoes,
  obterResumoRelatoriosApi,
  type ResumoRelatoriosApi,
} from "../features/relatorios/infrastructure/relatorios-api";
import {
  capturarComprovantePng,
  compartilharOuBaixarArquivo,
  formatarGeradoEm,
  gerarRelatorioPdfDoElemento,
} from "../features/relatorios/infrastructure/exportar-comprovante";

function hojeISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

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
            <span className="shrink-0 text-right font-semibold text-primary">
              {item.taxaPercentual}%
              <span className="block text-xs font-normal text-muted-foreground">
                {item.diagnosticadas}{" "}
                {item.diagnosticadas === 1 ? "diagnóstico" : "diagnósticos"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Cartao>
  );
}

export function Relatorios() {
  const comprovanteRef = useRef<HTMLDivElement>(null);
  const relatorioPdfRef = useRef<HTMLDivElement>(null);
  const [resumo, setResumo] = useState<ResumoRelatoriosApi | null>(null);
  const [erro, setErro] = useState("");
  const [exportando, setExportando] = useState<
    "csv" | "imagem" | "pdf" | null
  >(null);
  const [geradoEm, setGeradoEm] = useState(() => formatarGeradoEm());
  const [exportarAberto, setExportarAberto] = useState(false);
  const [previaPdfAberta, setPreviaPdfAberta] = useState(false);
  const [periodo, setPeriodo] = useState<PeriodoRelatorio>(() =>
    periodoMesDe(hojeISO()),
  );
  const [carregando, setCarregando] = useState(true);

  const consulta = useMemo(
  () => ({
      tipo: "intervalo" as const,
      de: periodo.inicio,
      ate: periodo.fim,
      hoje: hojeISO(),
    }),
    [periodo.inicio, periodo.fim],
  );

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    void (async () => {
      try {
        const dados = await obterResumoRelatoriosApi(consulta);
        if (ativo) {
          setResumo(dados);
          setErro("");
        }
      } catch {
        if (ativo) setErro("Não foi possível carregar.");
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [consulta]);

  async function exportarCsv() {
    setExportando("csv");
    setErro("");
    try {
      const blob = await baixarCsvInseminacoes(consulta);
      await compartilharOuBaixarArquivo(
        blob,
        "inseminaai-inseminacoes.csv",
        "Inseminações exportadas",
      );
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
      setErro(
        cause instanceof Error ? cause.message : "Falha ao exportar o CSV.",
      );
    } finally {
      setExportando(null);
    }
  }

  async function exportarComprovanteImagem() {
    const el = comprovanteRef.current;
    if (!el || !resumo) {
      setErro("Aguarde o resumo carregar.");
      return;
    }
    setExportando("imagem");
    setErro("");
    const momento = formatarGeradoEm();
    setGeradoEm(momento);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      const png = await capturarComprovantePng(el);
      await compartilharOuBaixarArquivo(
        png,
        `inseminaai-comprovante-${Date.now()}.png`,
        "Comprovante Insemina aí",
      );
    } catch (cause) {
      setErro(
        cause instanceof Error ? cause.message : "Falha ao gerar comprovante.",
      );
    } finally {
      setExportando(null);
    }
  }

  function abrirPreviaPdf() {
    if (!resumo) {
      setErro("Aguarde o resumo carregar.");
      return;
    }
    setGeradoEm(formatarGeradoEm());
    setPreviaPdfAberta(true);
  }

  async function exportarRelatorioPdf() {
    const el = relatorioPdfRef.current;
    if (!el || !resumo) {
      setErro("Aguarde o resumo carregar.");
      return;
    }
    setExportando("pdf");
    setErro("");
    const momento = formatarGeradoEm();
    setGeradoEm(momento);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      const pdf = await gerarRelatorioPdfDoElemento(el);
      await compartilharOuBaixarArquivo(
        pdf,
        `inseminaai-relatorio-${Date.now()}.pdf`,
        "Relatório Insemina aí",
      );
      setPreviaPdfAberta(false);
    } catch (cause) {
      setErro(
        cause instanceof Error ? cause.message : "Falha ao gerar o PDF.",
      );
    } finally {
      setExportando(null);
    }
  }

  const dados = resumo ?? {
    periodo,
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
          <SeletorPeriodoRelatorio periodo={periodo} onChange={setPeriodo} />
        </Cartao>
        {carregando ? (
          <p className="text-sm text-muted-foreground">Atualizando números…</p>
        ) : null}
        <Cartao className="p-4">
          <p className="text-xs text-muted-foreground">Taxa de prenhez</p>
          <p className="mt-1 text-3xl font-semibold">
            {dados.taxaPrenhezGeral}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {dados.prenhes} prenhes em {dados.diagnosticadas} com diagnóstico
            (prenhe ou vazia)
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Média de repetições por matriz:{" "}
            <span className="font-semibold text-foreground">
              {dados.mediaRepeticoes}
            </span>
          </p>
        </Cartao>
        <Cartao className="p-4 text-sm text-muted-foreground">
          Nas taxas por reprodutor, tipo ou lote, o número abaixo da porcentagem
          é <strong className="text-foreground">quantos diagnósticos</strong>{" "}
          entraram no cálculo daquele grupo — não é fórmula do mercado, é só o
          tamanho da amostra no seu cadastro.
        </Cartao>
        <div className="grid grid-cols-2 gap-3">
          <Cartao className="p-4">
            <p className="text-xs text-muted-foreground">Inseminadas no período</p>
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
          disabled={exportando !== null}
          onClick={() => setExportarAberto(true)}
        >
          <Share2 className="size-5" />
          {exportando !== null ? "Gerando…" : "Exportar / compartilhar"}
        </Botao>
        <ExportarRelatoriosSheet
          aberto={exportarAberto}
          exportando={exportando}
          desabilitarResumo={!resumo}
          onFechar={() => setExportarAberto(false)}
          onExportarCsv={() => void exportarCsv()}
          onExportarImagem={() => void exportarComprovanteImagem()}
          onExportarPdf={() => void exportarRelatorioPdf()}
          onPreviaPdf={abrirPreviaPdf}
        />
        {resumo ? (
          <PreviaRelatorioPdf
            aberto={previaPdfAberta}
            dados={resumo}
            geradoEm={geradoEm}
            gerandoPdf={exportando === "pdf"}
            onFechar={() => setPreviaPdfAberta(false)}
            onGerarPdf={() => void exportarRelatorioPdf()}
          />
        ) : null}
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 -z-10 opacity-0"
      >
        <ComprovanteRelatorio
          ref={comprovanteRef}
          dados={dados}
          geradoEm={geradoEm}
        />
        <RelatorioCompletoDocumento
          ref={relatorioPdfRef}
          dados={dados}
          geradoEm={geradoEm}
        />
      </div>
    </AppShell>
  );
}