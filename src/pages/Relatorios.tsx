import { AppShell, Cartao } from "../components/ui";
import { matrizes, resumo } from "../data/mock";

const totalComRegistro = matrizes.filter((m) => m.situacao !== "sem").length;
const prenhes = matrizes.filter((m) => m.situacao === "prenhe").length;
const taxa = totalComRegistro === 0 ? 0 : Math.round((prenhes / totalComRegistro) * 100);

export function Relatorios() {
  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
        <h1 className="text-lg font-semibold">Relatórios</h1>
      </header>
      <div className="space-y-3 px-4 py-4">
        <Cartao className="p-4">
          <p className="text-xs text-muted-foreground">Taxa de prenhez</p>
          <p className="mt-1 text-3xl font-semibold">{taxa}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {prenhes} prenhes em {totalComRegistro} matrizes com registro
          </p>
        </Cartao>
        <div className="grid grid-cols-2 gap-3">
          <Cartao className="p-4">
            <p className="text-xs text-muted-foreground">Inseminadas no mês</p>
            <p className="mt-1 text-2xl font-semibold">{resumo.inseminadasMes}</p>
          </Cartao>
          <Cartao className="p-4">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="mt-1 text-2xl font-semibold">{resumo.aguardando}</p>
          </Cartao>
        </div>
        <Cartao className="p-4">
          <p className="text-sm font-semibold">Por situação</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Prenhe</span>
              <span className="font-semibold text-status-prenhe">
                {matrizes.filter((m) => m.situacao === "prenhe").length}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Pendente</span>
              <span className="font-semibold text-status-pendente">
                {matrizes.filter((m) => m.situacao === "pendente").length}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Vazia</span>
              <span className="font-semibold text-status-vazia">
                {matrizes.filter((m) => m.situacao === "vazia").length}
              </span>
            </li>
          </ul>
        </Cartao>
      </div>
    </AppShell>
  );
}
