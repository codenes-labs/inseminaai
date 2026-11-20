import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Campo, cx } from "../../../components/ui";
import {
  diaEstaNoIntervalo,
  gradeCalendario,
  partesDeIso,
  tituloMesPt,
} from "../domain/calendario";
import {
  formatarPeriodoCampo,
  ordenarPeriodo,
  periodoAteHoje,
  periodoMesDe,
  type PeriodoRelatorio,
} from "../domain/periodo";

function hojeISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

type Props = {
  periodo: PeriodoRelatorio;
  onChange: (periodo: PeriodoRelatorio) => void;
};

export function SeletorPeriodoRelatorio({ periodo, onChange }: Props) {
  const hoje = hojeISO();
  const [aberto, setAberto] = useState(false);
  const [visaoAno, setVisaoAno] = useState(() => partesDeIso(periodo.inicio).ano);
  const [visaoMes, setVisaoMes] = useState(() => partesDeIso(periodo.inicio).mes);
  const [marcandoInicio, setMarcandoInicio] = useState<string | null>(null);
  const [marcandoFim, setMarcandoFim] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    const p = partesDeIso(periodo.inicio);
    setVisaoAno(p.ano);
    setVisaoMes(p.mes);
    setMarcandoInicio(periodo.inicio);
    setMarcandoFim(periodo.fim);
  }, [aberto, periodo.inicio, periodo.fim]);

  const inicioSel = marcandoInicio;
  const fimSel = marcandoFim;

  function mesAnterior() {
    if (visaoMes === 1) {
      setVisaoMes(12);
      setVisaoAno((a) => a - 1);
      return;
    }
    setVisaoMes((m) => m - 1);
  }

  function mesSeguinte() {
    if (visaoMes === 12) {
      setVisaoMes(1);
      setVisaoAno((a) => a + 1);
      return;
    }
    setVisaoMes((m) => m + 1);
  }

  function escolherDia(iso: string) {
    if (iso > hoje) return;

    if (!inicioSel || (inicioSel && fimSel)) {
      setMarcandoInicio(iso);
      setMarcandoFim(null);
      return;
    }

    const ordenado = ordenarPeriodo(inicioSel, iso);
    onChange(ordenado);
    setMarcandoInicio(ordenado.inicio);
    setMarcandoFim(ordenado.fim);
    setAberto(false);
  }

  function limpar() {
    onChange(periodoMesDe(hoje));
    setMarcandoInicio(null);
    setMarcandoFim(null);
    setAberto(false);
  }

  function atalhoHoje() {
    const novo = periodoAteHoje(hoje);
    onChange(novo);
    setMarcandoInicio(novo.inicio);
    setMarcandoFim(novo.fim);
    setAberto(false);
  }

  const dias = gradeCalendario(visaoAno, visaoMes);

  return (
    <div className="relative">
      <Campo rotulo="Período">
        <button
          type="button"
          className="flex h-12 w-full min-w-0 flex-1 items-center justify-between gap-3 bg-transparent text-base font-medium text-foreground outline-none"
          aria-expanded={aberto}
          aria-haspopup="dialog"
          onClick={() => setAberto((v) => !v)}
        >
          <span className="truncate text-left">
            {formatarPeriodoCampo(periodo)}
          </span>
          <Calendar
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
      </Campo>
      {aberto ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/20"
            aria-label="Fechar calendário"
            onClick={() => setAberto(false)}
          />
          <div
            className="absolute inset-x-0 top-full z-40 mt-1 rounded-xl border border-border bg-card p-3 shadow-(--shadow-card)"
            role="dialog"
            aria-label="Selecionar período"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                className="press flex size-10 items-center justify-center rounded-md text-muted-foreground"
                aria-label="Mês anterior"
                onClick={mesAnterior}
              >
                <ChevronLeft className="size-5" />
              </button>
              <p className="text-center text-sm font-semibold">
                {tituloMesPt(visaoAno, visaoMes)}
              </p>
              <button
                type="button"
                className="press flex size-10 items-center justify-center rounded-md text-muted-foreground"
                aria-label="Próximo mês"
                onClick={mesSeguinte}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center text-xs font-medium text-muted-foreground">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((letra, i) => (
                <span key={`${letra}-${i}`} className="py-1">
                  {letra}
                </span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-0.5">
              {dias.map((celula) => {
                const noIntervalo = diaEstaNoIntervalo(
                  celula.iso,
                  inicioSel,
                  fimSel,
                );
                const ehInicio = celula.iso === inicioSel;
                const ehFim = fimSel !== null && celula.iso === fimSel;
                const extremidade = ehInicio || ehFim;
                const futuro = celula.iso > hoje;

                return (
                  <button
                    key={celula.iso}
                    type="button"
                    disabled={futuro}
                    onClick={() => escolherDia(celula.iso)}
                    className={cx(
                      "press mx-auto flex size-9 items-center justify-center rounded-full text-sm",
                      celula.foraMes && "text-muted-foreground/60",
                      !celula.foraMes && !futuro && "text-foreground",
                      futuro && "cursor-not-allowed text-muted-foreground/40",
                      noIntervalo && !extremidade && "bg-brand-soft text-primary",
                      extremidade && "bg-primary font-semibold text-primary-foreground",
                    )}
                  >
                    {celula.dia}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Toque no primeiro dia e depois no último do período.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
              <button
                type="button"
                className="press px-2 py-1 text-primary"
                onClick={limpar}
              >
                Limpar
              </button>
              <button
                type="button"
                className="press px-2 py-1 text-primary"
                onClick={atalhoHoje}
              >
                Hoje
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}