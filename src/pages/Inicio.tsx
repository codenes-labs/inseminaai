import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  CircleX,
  Heart,
  Syringe,
  ChevronRight,
  TriangleAlert,
} from "lucide-react";
import {
  AppShell,
  CalfIcon,
  Cartao,
  Logo,
  TituloSecao,
} from "../components/ui";
import {
  proximosPartos,
  resumo,
  ultimasInseminacoes,
} from "../data/mock";
import { lerSessao } from "../lib/auth";

const hoje = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function CartaoResumo({
  icone,
  numero,
  rotulo,
  tom,
}: {
  icone: ReactNode;
  numero: number;
  rotulo: string;
  tom: string;
}) {
  return (
    <Cartao className="press p-4">
      <div
        className={`mb-3 flex size-10 items-center justify-center rounded-full [&>svg]:size-5 [&>svg]:stroke-[1.75] ${tom}`}
      >
        {icone}
      </div>
      <p className="text-3xl font-semibold leading-none">{numero}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{rotulo}</p>
    </Cartao>
  );
}

export function Inicio() {
  const nome = lerSessao()?.nome ?? "Vitor";
  const data = hoje.charAt(0).toUpperCase() + hoje.slice(1);

  return (
    <AppShell>
      <header className="rounded-b-[28px] bg-primary px-5 pb-16 pt-6 text-primary-foreground">
        <Logo claro />
        <h1 className="mt-5 text-2xl font-semibold">Olá, {nome} 👋</h1>
        <p className="mt-1 text-sm opacity-80">{data}</p>
      </header>
      <div className="-mt-10 px-4">
        <div className="grid grid-cols-2 gap-3">
          <CartaoResumo
            icone={<Syringe />}
            numero={resumo.inseminadasMes}
            rotulo="Inseminadas no mês"
            tom="bg-brand-soft text-primary"
          />
          <CartaoResumo
            icone={<CalendarClock />}
            numero={resumo.aguardando}
            rotulo="Aguardando diagnóstico"
            tom="bg-warning-soft text-status-pendente"
          />
          <CartaoResumo
            icone={<Heart />}
            numero={resumo.prenhes}
            rotulo="Prenhes"
            tom="bg-brand-soft text-status-prenhe"
          />
          <CartaoResumo
            icone={<CircleX />}
            numero={resumo.vazias}
            rotulo="Vazias/Repetidas"
            tom="bg-danger-soft text-status-vazia"
          />
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-status-pendente/30 bg-warning-soft p-4">
          <TriangleAlert className="size-6 shrink-0 text-status-pendente" strokeWidth={1.75} />
          <p className="flex-1 text-sm font-medium text-foreground">
            3 diagnósticos vencem nos próximos 7 dias
          </p>
          <Link
            to="/matrizes"
            className="press flex min-h-11 items-center rounded-md bg-status-pendente px-4 text-sm font-semibold text-primary-foreground"
          >
            Ver
          </Link>
        </div>
        <TituloSecao>Próximos partos</TituloSecao>
        <Cartao className="divide-y divide-border p-0">
          {proximosPartos.map((parto) => (
            <div key={parto.nome} className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                <CalfIcon className="size-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{parto.nome}</p>
                <p className="text-xs text-muted-foreground">Previsto {parto.data}</p>
              </div>
              <span className="text-sm font-semibold text-primary">{parto.dias} dias</span>
            </div>
          ))}
        </Cartao>
        <TituloSecao
          acao={
            <Link to="/matrizes" className="text-sm font-medium text-brand">
              Ver todas
            </Link>
          }
        >
          Últimas inseminações
        </TituloSecao>
        <Cartao className="divide-y divide-border p-0">
          {ultimasInseminacoes.map((item) => (
            <Link
              key={item.nome}
              to="/matrizes"
              className="flex items-center gap-3 px-4 py-3.5"
            >
              <div className="flex-1">
                <p className="font-semibold">
                  {item.nome}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    #{item.brinco}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.data} · {item.reprodutor}
                </p>
              </div>
              <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-primary">
                {item.tipo}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </Cartao>
      </div>
    </AppShell>
  );
}
