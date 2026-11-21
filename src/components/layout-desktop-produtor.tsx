import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ChartColumn,
  House,
  Menu,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo, cx } from "./ui";
import {
  ehAdminPlataformaCodenes,
  mostrarAtalhoCadastrosPlataformaNoApp,
} from "../domain/auth/admin-plataforma-codenes";
import { desativarModoAppPlataforma } from "../domain/auth/plataforma-modo-app";
import { lerSessao, sair } from "../lib/auth";

function ItemNav({
  to,
  icone: Icone,
  rotulo,
  fim,
}: {
  to: string;
  icone: LucideIcon;
  rotulo: string;
  fim?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={fim}
      className={({ isActive }) =>
        cx(
          "press flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted",
        )
      }
    >
      <Icone className="size-5 shrink-0" strokeWidth={1.75} />
      {rotulo}
    </NavLink>
  );
}

export function LayoutDesktopProdutor({ children }: { children: ReactNode }) {
  const sessao = lerSessao();

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-border bg-card px-3 py-4">
        <div className="mb-6 px-2">
          <Logo />
          {sessao?.nome ? (
            <p className="mt-3 truncate text-xs text-muted-foreground">{sessao.nome}</p>
          ) : null}
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <ItemNav to="/inicio" icone={House} rotulo="Início" fim />
          <ItemNav to="/matrizes" icone={Users} rotulo="Matrizes" />
          <ItemNav to="/relatorios" icone={ChartColumn} rotulo="Relatórios" />
          <ItemNav to="/mais" icone={Menu} rotulo="Mais" fim />
        </nav>
        <Link
          to="/nova-inseminacao"
          className="press mt-4 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground"
        >
          <Plus className="size-5" />
          Nova inseminação
        </Link>
        {mostrarAtalhoCadastrosPlataformaNoApp(sessao) ? (
          <Link
            to="/admin/cadastros"
            className="press mt-3 block rounded-lg border border-border px-3 py-2 text-center text-xs font-semibold text-primary"
            onClick={() => desativarModoAppPlataforma()}
          >
            {ehAdminPlataformaCodenes(sessao)
              ? "Administração da plataforma"
              : "Clientes na plataforma"}
          </Link>
        ) : null}
        <button
          type="button"
          className="press mt-3 px-2 text-left text-xs font-semibold text-muted-foreground hover:text-foreground"
          onClick={() => {
            sair();
            window.location.href = "/entrar";
          }}
        >
          Sair
        </button>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto min-h-dvh w-full max-w-4xl">{children}</div>
      </div>
    </div>
  );
}