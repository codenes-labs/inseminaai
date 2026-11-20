import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { CowIcon, cx } from "../../components/ui";
import { aoMoverGlowCard } from "./glow-card-handlers";

const STEP_TAGS = ["1/3 • Registro", "2/3 • Previsões", "3/3 • Sincronizado"] as const;

const STEP_ARIA = [
  "Registro da inseminação",
  "Previsões de datas",
  "Salvo offline e sincronizado",
] as const;

type Props = {
  step: number;
  onStepChange: (step: number) => void;
  cardId?: string;
};

export function LandingPwaShowcase({
  step,
  onStepChange,
  cardId = "pwaShowcaseCard",
}: Props) {
  return (
    <div
      id={cardId}
      className="landing-glow-card landing-soft-shadow relative rounded-[22px] border border-border bg-card p-5 transition-shadow duration-300 sm:p-6"
      onMouseMove={aoMoverGlowCard}
    >
      <div className="landing-field-grid pointer-events-none absolute inset-0 rounded-[22px] opacity-60" />
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-brand-soft">
            <CowIcon className="size-5 text-brand" />
          </div>
          <div>
            <span className="block text-xs font-bold leading-tight">Insemina aí no celular</span>
            <span className="text-[11px] text-muted-foreground">
              Uma mão só • Salva sem sinal no curral
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5"
          role="tablist"
          aria-label="Etapas do simulador"
        >
          {[0, 1, 2].map((indice) => (
            <button
              key={indice}
              type="button"
              onClick={() => onStepChange(indice)}
              className={cx(
                "h-1.5 rounded-full transition-all duration-300",
                step === indice ? "w-6 bg-primary" : "w-2 bg-border",
              )}
              aria-label={STEP_ARIA[indice]}
              aria-current={step === indice ? "step" : undefined}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto my-2 max-w-[295px]">
        <div className="landing-phone-shadow rounded-[24px] border-2 border-border bg-muted p-3.5">
          <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2.5 text-[10.5px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-brand" />
              Fazenda Santa Fé
            </span>
            <span className="rounded-md bg-brand-soft px-2 py-0.5 font-semibold text-primary">
              {STEP_TAGS[step]}
            </span>
          </div>

          <div className="relative min-h-[228px]">
            <div className="min-h-[168px]">
            {step === 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Matriz Selecionada
                    </span>
                    <div className="font-display flex items-center gap-1.5 text-base font-bold">
                      Matriz #408
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Nelore
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg bg-brand-soft px-2 py-1 text-[11px] font-bold text-brand">
                    1ª Tentativa
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl border border-border bg-card p-2">
                    <span className="block text-[9.5px] text-muted-foreground">Reprodutor</span>
                    <span className="font-semibold">Touro Imperador</span>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-2">
                    <span className="block text-[9.5px] text-muted-foreground">Tipo</span>
                    <span className="font-semibold">IATF</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">Hoje • 07:42</span>
                  <span className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
                    Salvar inseminação
                  </span>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">Previsões Calculadas</span>
                  <span className="text-[10px] font-medium text-brand">Regras do domínio</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-[11px] font-bold text-primary">
                        +30d
                      </span>
                      <div>
                        <span className="block text-[11px] font-semibold">
                          Diagnóstico (Toque/US)
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Previsão automática
                        </span>
                      </div>
                    </div>
                    <span className="text-[11.5px] font-bold text-primary">20 Dez</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-[11px] font-bold text-primary">
                        +283d
                      </span>
                      <div>
                        <span className="block text-[11px] font-semibold">
                          Previsão de Parto
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Após prenhe no diagnóstico
                        </span>
                      </div>
                    </div>
                    <span className="text-[11.5px] font-bold text-primary">01 Set</span>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="flex flex-col items-center justify-center space-y-2.5 py-2 text-center">
                <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden">
                  <span className="landing-signal pointer-events-none absolute inset-0 rounded-full bg-brand/25" />
                  <span className="landing-signal-delay pointer-events-none absolute inset-0 rounded-full bg-brand/20" />
                  <div className="relative flex size-10 items-center justify-center rounded-full border border-brand/40 bg-brand-soft text-brand">
                    <Check className="size-5" strokeWidth={2.4} />
                  </div>
                </div>
                <div>
                  <p className="font-display text-[13.5px] font-bold">Offline salvo — Sincronizado</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    Matriz #408 gravada no aparelho sem sinal e enviada ao cadastro na estrada.
                  </p>
                </div>
              </div>
            ) : null}
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border pt-2.5">
              <button
                type="button"
                onClick={() => onStepChange(step - 1)}
                disabled={step === 0}
                className={cx(
                  "press inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[10.5px] font-semibold",
                  step === 0
                    ? "invisible"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Etapa anterior da demonstração"
              >
                <ArrowLeft className="size-3" aria-hidden />
                Voltar
              </button>
              {step < 2 ? (
                <button
                  type="button"
                  onClick={() => onStepChange(step + 1)}
                  className="press inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[10.5px] font-semibold text-primary"
                  aria-label={
                    step === 0
                      ? "Próxima etapa: previsões de datas"
                      : "Próxima etapa: sincronização"
                  }
                >
                  Próximo
                  <ArrowRight className="size-3" aria-hidden />
                </button>
              ) : (
                <span className="text-[10px] font-medium text-muted-foreground">
                  Fim da demonstração
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-10 mt-3.5 px-2 text-center text-[12.5px] leading-snug text-muted-foreground">
        No celular: o mesmo registro que você faz no serviço, guardado com segurança no seu
        cadastro.
      </p>
    </div>
  );
}