import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  Download,
  LineChart,
  Smartphone,
} from "lucide-react";
import { PublicSiteChrome } from "../components/public-site-chrome";
import { LandingPwaShowcase } from "./landing/LandingPwaShowcase";
import { aoMoverGlowCard } from "./landing/glow-card-handlers";
import { useLandingReveal } from "./landing/use-landing-reveal";
import "./landing/landing.css";

const PASSOS = [
  {
    passo: "Passo 01",
    titulo: "1. Registrar no campo",
    texto:
      "Nova inseminação com poucos toques: matriz, reprodutor, inseminador, data e tipo.",
    icone: ClipboardCheck,
  },
  {
    passo: "Passo 02",
    titulo: "2. Acompanhar tentativas",
    texto:
      "Repetições numeradas, status prenhe ou vazia e datas de diagnóstico e parto calculadas pelas regras do domínio.",
    icone: BarChart3,
  },
  {
    passo: "Passo 03",
    titulo: "3. Ver o rebanho",
    texto:
      "Lista das matrizes que você acompanha, resumo do trabalho e relatórios — só o seu cadastro.",
    icone: LineChart,
  },
] as const;

const SELOS = [
  {
    titulo: "Funciona sem sinal",
    texto: "Salva no curral e sincroniza depois",
    icone: Smartphone,
  },
  {
    titulo: "Multi-propriedades",
    texto: "Várias fazendas em 1 conta",
    icone: Building2,
  },
  {
    titulo: "Exportação CSV",
    texto: "Relatórios prontos no celular",
    icone: Download,
  },
] as const;

export function LandingPage() {
  const [pwaStep, setPwaStep] = useState(0);
  const cicloRef = useRef<number | null>(null);
  useLandingReveal();

  const reiniciarCicloPwa = useCallback(() => {
    if (cicloRef.current !== null) {
      window.clearInterval(cicloRef.current);
    }
    cicloRef.current = window.setInterval(() => {
      setPwaStep((atual) => (atual + 1) % 3);
    }, 4500);
  }, []);

  useEffect(() => {
    reiniciarCicloPwa();
    return () => {
      if (cicloRef.current !== null) window.clearInterval(cicloRef.current);
    };
  }, [reiniciarCicloPwa]);

  const alterarPwaStep = useCallback(
    (step: number) => {
      setPwaStep(step);
      reiniciarCicloPwa();
    },
    [reiniciarCicloPwa],
  );

  return (
    <PublicSiteChrome>
      <div className="landing-page overflow-x-clip pb-6 pt-4 sm:pt-6">
        <section className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12 xl:gap-10">
          <div className="min-w-0 space-y-5 xl:col-span-7">
            <div
              className="landing-reveal inline-flex items-center gap-2 rounded-full border border-border bg-brand-soft/80 px-3 py-1"
              style={{ transitionDelay: "40ms" }}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              <span className="text-[11.5px] font-bold tracking-[0.08em] text-brand uppercase">
                Pecuária de corte e leite
              </span>
            </div>

            <h1
              className="landing-reveal font-display max-w-full text-[34px] leading-[1.12] font-extrabold tracking-tight text-balance sm:text-[42px] xl:text-[45px]"
              style={{ transitionDelay: "110ms" }}
            >
              Inseminações no bolso, sem planilha solta
            </h1>

            <p
              className="landing-reveal max-w-[540px] text-base leading-relaxed text-muted-foreground sm:text-[17px]"
              style={{ transitionDelay: "180ms" }}
            >
              O Insemina aí é para o inseminador autônomo que registra matrizes, tentativas,
              diagnósticos e repetições no celular — uma mão só, no curral ou na estrada.
              Previsões de data, relatórios e exportação em CSV, sem planilha solta.
            </p>

          </div>

          <div className="landing-reveal min-w-0 xl:col-span-5" style={{ transitionDelay: "200ms" }}>
            <LandingPwaShowcase
              step={pwaStep}
              onStepChange={alterarPwaStep}
            />
          </div>
        </section>

        <section
          aria-label="Como funciona o Insemina aí"
          className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3"
        >
          {PASSOS.map((item, indice) => {
            const Icone = item.icone;
            return (
              <article
                key={item.titulo}
                className="landing-step-card landing-glow-card landing-reveal landing-soft-shadow rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-card)"
                style={{ transitionDelay: `${80 + indice * 80}ms` }}
                onMouseMove={aoMoverGlowCard}
              >
                <div className="mb-3.5 flex items-center justify-between">
                  <span className="landing-icon-bounce flex size-9 items-center justify-center rounded-xl bg-brand-soft text-primary transition-transform duration-300">
                    <Icone className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {item.passo}
                  </span>
                </div>
                <h2 className="font-display mb-2 text-[16.5px] font-bold">{item.titulo}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.texto}</p>
              </article>
            );
          })}
        </section>

        <section
          aria-labelledby="para-quem-titulo"
          className="landing-reveal mt-5 sm:mt-6"
          style={{ transitionDelay: "140ms" }}
        >
          <div
            className="landing-glow-card landing-soft-shadow flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
            onMouseMove={aoMoverGlowCard}
          >
            <div className="max-w-[610px] space-y-3">
              <h2 id="para-quem-titulo" className="font-display text-xl font-bold sm:text-[21px]">
                Para quem é
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                Inseminadores autônomos que hoje anotam em caderno ou planilha e querem um
                lugar único, seguro e que funciona offline quando não há sinal. Também serve a
                quem atende várias propriedades no mesmo cadastro.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:min-w-[245px] lg:grid-cols-1">
              {SELOS.map((selo) => {
                const Icone = selo.icone;
                return (
                  <div
                    key={selo.titulo}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted px-3.5 py-2.5 transition-transform duration-200 hover:translate-x-1"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <Icone className="size-4" strokeWidth={1.75} />
                    </span>
                    <div>
                      <span className="block text-xs font-bold">{selo.titulo}</span>
                      <span className="text-[11px] text-muted-foreground">{selo.texto}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </PublicSiteChrome>
  );
}