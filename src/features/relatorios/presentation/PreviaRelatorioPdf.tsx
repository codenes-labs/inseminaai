import { FileText, X } from "lucide-react";
import { Botao } from "../../../components/ui";
import type { ResumoRelatoriosApi } from "../infrastructure/relatorios-api";
import { RelatorioCompletoDocumento } from "./RelatorioCompletoDocumento";

type Props = {
  aberto: boolean;
  dados: ResumoRelatoriosApi;
  geradoEm: string;
  gerandoPdf: boolean;
  onFechar: () => void;
  onGerarPdf: () => void;
};

export function PreviaRelatorioPdf({
  aberto,
  dados,
  geradoEm,
  gerandoPdf,
  onFechar,
  onGerarPdf,
}: Props) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[480px]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar prévia"
        onClick={onFechar}
      />
      <div
        className="absolute inset-x-0 bottom-0 top-10 flex flex-col rounded-t-xl border border-border bg-background shadow-(--shadow-card)"
        role="dialog"
        aria-labelledby="previa-relatorio-titulo"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p
            id="previa-relatorio-titulo"
            className="text-base font-semibold text-foreground"
          >
            Prévia do PDF
          </p>
          <button
            type="button"
            className="press flex size-10 items-center justify-center rounded-md text-muted-foreground"
            aria-label="Fechar"
            onClick={onFechar}
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="shrink-0 px-4 py-2 text-sm text-muted-foreground">
          Confira o layout antes de gerar o arquivo. Os números são os mesmos do
          relatório na tela.
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2">
          <div className="mx-auto w-full max-w-[595px] shadow-md">
            <RelatorioCompletoDocumento dados={dados} geradoEm={geradoEm} />
          </div>
        </div>
        <div className="shrink-0 space-y-2 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Botao
            type="button"
            disabled={gerandoPdf}
            onClick={() => void onGerarPdf()}
          >
            <FileText className="size-5" />
            {gerandoPdf ? "Gerando PDF…" : "Gerar e compartilhar PDF"}
          </Botao>
          <Botao type="button" variante="suave" onClick={onFechar}>
            Voltar
          </Botao>
        </div>
      </div>
    </div>
  );
}