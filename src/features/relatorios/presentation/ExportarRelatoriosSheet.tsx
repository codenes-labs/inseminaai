import { Download, Eye, FileImage, FileText, X } from "lucide-react";
import { Botao } from "../../../components/ui";

type TipoExportacao = "csv" | "imagem" | "pdf";

type Props = {
  aberto: boolean;
  exportando: TipoExportacao | null;
  desabilitarResumo: boolean;
  onFechar: () => void;
  onExportarCsv: () => void;
  onExportarImagem: () => void;
  onExportarPdf: () => void;
  onPreviaPdf: () => void;
};

export function ExportarRelatoriosSheet({
  aberto,
  exportando,
  desabilitarResumo,
  onFechar,
  onExportarCsv,
  onExportarImagem,
  onExportarPdf,
  onPreviaPdf,
}: Props) {
  if (!aberto) return null;

  const ocupado = exportando !== null;

  return (
    <div className="fixed inset-0 z-40 mx-auto max-w-[480px]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar exportação"
        onClick={onFechar}
      />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-xl border border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-(--shadow-card)"
        role="dialog"
        aria-labelledby="exportar-relatorios-titulo"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p
            id="exportar-relatorios-titulo"
            className="text-base font-semibold text-foreground"
          >
            Exportar / compartilhar
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
        <p className="mb-3 text-sm text-muted-foreground">
          Planilha para análise, comprovante rápido ou relatório completo em
          PDF para o dono da fazenda.
        </p>
        <div className="space-y-2">
          <Botao
            type="button"
            variante="suave"
            disabled={ocupado}
            onClick={() => {
              onExportarCsv();
              onFechar();
            }}
          >
            <Download className="size-5" />
            {exportando === "csv"
              ? "Gerando…"
              : "Planilha de inseminações (CSV)"}
          </Botao>
          <Botao
            type="button"
            variante="suave"
            disabled={ocupado || desabilitarResumo}
            onClick={() => {
              onExportarImagem();
              onFechar();
            }}
          >
            <FileImage className="size-5" />
            {exportando === "imagem"
              ? "Gerando…"
              : "Comprovante para compartilhar (imagem)"}
          </Botao>
          <Botao
            type="button"
            variante="suave"
            disabled={ocupado || desabilitarResumo}
            onClick={() => {
              onPreviaPdf();
              onFechar();
            }}
          >
            <Eye className="size-5" />
            Prévia do relatório (PDF)
          </Botao>
          <Botao
            type="button"
            variante="suave"
            disabled={ocupado || desabilitarResumo}
            onClick={() => {
              onExportarPdf();
              onFechar();
            }}
          >
            <FileText className="size-5" />
            {exportando === "pdf"
              ? "Gerando…"
              : "Relatório completo (PDF)"}
          </Botao>
        </div>
      </div>
    </div>
  );
}