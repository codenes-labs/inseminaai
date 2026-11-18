import { Link } from "react-router-dom";
import { PublicSiteChrome } from "../components/public-site-chrome";
import { Cartao, CowIcon } from "../components/ui";

export function LandingPage() {
  return (
    <PublicSiteChrome>
      <section className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Pecuária de corte e leite
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight break-words sm:text-4xl">
            Inseminações no bolso, sem planilha solta
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            O Insemina aí ajuda produtores e inseminadores a registrar matrizes, tentativas,
            diagnósticos, repetições e lotes — com previsões de data e relatórios claros. É um
            PWA pensado para o celular, uma mão só, no curral ou na estrada.
          </p>
        </div>
        <Cartao className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <CowIcon className="size-9" />
          </div>
          <p className="text-sm text-muted-foreground">
            Identidade verde já definida no produto. O app logado entra nas próximas sprints de
            plataforma e MVP.
          </p>
        </Cartao>
      </section>
      <section className="mt-10 grid min-w-0 gap-3 md:grid-cols-3">
        <Cartao className="p-4">
          <h2 className="font-semibold">1. Registrar no campo</h2>
          <p className="mt-2 text-muted-foreground">
            Nova inseminação com poucos toques: matriz, reprodutor, inseminador, data e tipo.
          </p>
        </Cartao>
        <Cartao className="p-4">
          <h2 className="font-semibold">2. Acompanhar tentativas</h2>
          <p className="mt-2 text-muted-foreground">
            Repetições numeradas, status prenhe ou vazia e datas de diagnóstico e parto calculadas
            pelas regras do domínio.
          </p>
        </Cartao>
        <Cartao className="p-4">
          <h2 className="font-semibold">3. Ver o rebanho</h2>
          <p className="mt-2 text-muted-foreground">
            Lista de matrizes, dashboard do lote e relatórios — sempre filtrado ao seu cadastro.
          </p>
        </Cartao>
      </section>
      <Cartao className="mt-6 p-4">
        <h2 className="text-xl font-semibold">Para quem é</h2>
        <p className="mt-2 text-muted-foreground">
          Fazendas, cooperativas e inseminadores que hoje anotam em caderno ou planilha e precisam de
          um lugar único, seguro e offline quando não há sinal.
        </p>
        <Link
          to="/entrar"
          className="press mt-4 inline-flex min-h-12 items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground"
        >
          Entrar
        </Link>
      </Cartao>
    </PublicSiteChrome>
  );
}