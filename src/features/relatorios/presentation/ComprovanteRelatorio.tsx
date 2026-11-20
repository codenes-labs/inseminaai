import { forwardRef } from "react";
import { formatarPeriodoBr } from "../domain/periodo";
import type { ResumoRelatoriosApi } from "../infrastructure/relatorios-api";

type Props = {
  dados: ResumoRelatoriosApi;
  geradoEm: string;
};

export const ComprovanteRelatorio = forwardRef<HTMLDivElement, Props>(
  function ComprovanteRelatorio({ dados, geradoEm }, ref) {
    const topReprodutores = dados.taxaPorReprodutor.slice(0, 5);

    return (
      <div
        ref={ref}
        className="w-[360px] overflow-hidden rounded-2xl bg-white font-sans text-foreground shadow-lg"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <div className="bg-[#14532D] px-5 py-4 text-white">
          <p className="text-lg font-semibold">Insemina aí</p>
          <p className="text-sm opacity-90">Resumo reprodutivo</p>
        </div>
        <div className="space-y-4 px-5 py-4">
          <p className="text-xs text-muted-foreground">
            {formatarPeriodoBr(dados.periodo)}
          </p>
          <p className="text-xs text-muted-foreground">Gerado em {geradoEm}</p>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Taxa de prenhez
            </p>
            <p className="text-4xl font-semibold text-[#14532D]">
              {dados.taxaPrenhezGeral}%
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {dados.prenhes} prenhes em {dados.diagnosticadas} com diagnóstico
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
            <div>
              <p className="text-muted-foreground">IA no período</p>
              <p className="text-xl font-semibold">{dados.inseminadasMes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pendentes</p>
              <p className="text-xl font-semibold">{dados.pendentes}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Média de repetições por matriz:{" "}
            <span className="font-semibold text-foreground">
              {dados.mediaRepeticoes}
            </span>
          </p>
          {topReprodutores.length > 0 ? (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Por reprodutor
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {topReprodutores.map((r) => (
                  <li key={r.chave} className="flex justify-between gap-2">
                    <span className="truncate">{r.chave}</span>
                    <span className="shrink-0 font-medium">
                      {r.taxaPercentual}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="border-t border-border pt-3 text-[10px] leading-snug text-muted-foreground">
            Comprovante gerado no app. Os dados completos e a planilha CSV
            permanecem no cadastro.
          </p>
        </div>
      </div>
    );
  },
);