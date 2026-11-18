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
            O Insemina aí é para o inseminador autônomo que registra matrizes, tentativas,
            diagnósticos e repetições no celular — uma mão só,
            no curral ou na estrada. Previsões de data, relatórios e exportação em CSV, sem planilha
            solta.
          </p>
        </div>
        <Cartao className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <CowIcon className="size-9" />
          </div>
          <p className="text-sm text-muted-foreground">
            PWA no celular: o mesmo registro que você faz no serviço, guardado com segurança no
            seu cadastro.
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
            Lista das matrizes que você acompanha, resumo do trabalho e relatórios — só o seu
            cadastro.
          </p>
        </Cartao>
      </section>
      <Cartao className="mt-6 p-4">
        <h2 className="text-xl font-semibold">Para quem é</h2>
        <p className="mt-2 text-muted-foreground">
          Inseminadores autônomos que hoje anotam em caderno ou planilha e querem um lugar único,
          seguro e que funciona offline quando não há sinal. Também serve a quem atende várias
          propriedades no mesmo cadastro.
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