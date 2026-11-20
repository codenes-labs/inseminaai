import { forwardRef } from "react";
import { formatarPeriodoBr } from "../domain/periodo";
import type { ResumoRelatoriosApi } from "../infrastructure/relatorios-api";
import { SITE_PUBLICO_ROTULO } from "../../../lib/site-publico";

type Props = {
  dados: ResumoRelatoriosApi;
  geradoEm: string;
};

function SecaoTaxas({
  titulo,
  itens,
}: {
  titulo: string;
  itens: { chave: string; taxaPercentual: number; diagnosticadas: number }[];
}) {
  if (itens.length === 0) return null;
  return (
    <section className="border-t border-[#e5e7eb] pt-4">
      <h2 className="text-sm font-semibold text-[#14532D]">{titulo}</h2>
      <ul className="mt-2 space-y-2 text-sm text-[#374151]">
        {itens.map((item) => (
          <li key={item.chave} className="flex items-start justify-between gap-3">
            <span className="min-w-0 flex-1 break-words">{item.chave}</span>
            <span className="shrink-0 text-right font-semibold text-[#14532D]">
              {item.taxaPercentual}%
              <span className="mt-0.5 block text-xs font-normal text-[#6b7280]">
                {item.diagnosticadas}{" "}
                {item.diagnosticadas === 1 ? "diagnóstico" : "diagnósticos"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const RelatorioCompletoDocumento = forwardRef<HTMLDivElement, Props>(
  function RelatorioCompletoDocumento({ dados, geradoEm }, ref) {
    return (
      <div
        ref={ref}
        className="w-[595px] overflow-hidden bg-white font-sans text-[#111827]"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <div className="bg-[#14532D] px-6 py-5 text-white">
          <p className="text-xl font-semibold">Insemina aí</p>
          <p className="mt-1 text-sm opacity-95">Relatório reprodutivo completo</p>
        </div>
        <div className="space-y-5 px-6 py-5 text-sm">
          <p className="text-xs text-[#6b7280]">
            Período: {formatarPeriodoBr(dados.periodo)}
          </p>
          <p className="text-xs text-[#6b7280]">Gerado em {geradoEm}</p>

          <section>
            <h2 className="text-sm font-semibold text-[#14532D]">Resumo geral</h2>
            <p className="mt-2 text-4xl font-semibold text-[#14532D]">
              {dados.taxaPrenhezGeral}%
            </p>
            <p className="mt-1 text-[#6b7280]">
              Taxa de prenhez · {dados.prenhes} prenhes em {dados.diagnosticadas}{" "}
              com diagnóstico (prenhe ou vazia)
            </p>
            <p className="mt-2 text-[#374151]">
              Média de repetições por matriz:{" "}
              <strong>{dados.mediaRepeticoes}</strong>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 border-t border-[#e5e7eb] pt-3">
              <div>
                <p className="text-xs text-[#6b7280]">Inseminadas no período</p>
                <p className="text-2xl font-semibold">{dados.inseminadasMes}</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Pendentes</p>
                <p className="text-2xl font-semibold">{dados.pendentes}</p>
              </div>
            </div>
          </section>

          <section className="border-t border-[#e5e7eb] pt-4">
            <h2 className="text-sm font-semibold text-[#14532D]">
              Matrizes ativas por situação
            </h2>
            <ul className="mt-2 space-y-1.5 text-[#374151]">
              <li className="flex justify-between">
                <span>Prenhe</span>
                <strong>{dados.porSituacao.prenhe}</strong>
              </li>
              <li className="flex justify-between">
                <span>Pendente</span>
                <strong>{dados.porSituacao.pendente}</strong>
              </li>
              <li className="flex justify-between">
                <span>Vazia</span>
                <strong>{dados.porSituacao.vazia}</strong>
              </li>
              <li className="flex justify-between">
                <span>Sem registro</span>
                <strong>{dados.porSituacao.sem}</strong>
              </li>
            </ul>
          </section>

          <SecaoTaxas titulo="Taxa por reprodutor" itens={dados.taxaPorReprodutor} />
          <SecaoTaxas titulo="Taxa por tipo" itens={dados.taxaPorTipo} />
          <SecaoTaxas titulo="Taxa por lote" itens={dados.taxaPorLote} />

          <section className="border-t border-[#e5e7eb] pt-4 text-xs leading-relaxed text-[#6b7280]">
            <p className="font-semibold text-[#374151]">Sobre este relatório</p>
            <p className="mt-2">
              Valores conforme o cadastro na data de geração. A planilha CSV traz
              cada inseminação em detalhe; este documento consolida taxas e totais
              para compartilhar com o produtor ou o dono da fazenda.
            </p>
          </section>
        </div>
        <div className="border-t border-[#e5e7eb] bg-[#f9fafb] px-6 py-3 text-center text-[10px] text-[#6b7280]">
          Insemina aí — {SITE_PUBLICO_ROTULO}
        </div>
      </div>
    );
  },
);