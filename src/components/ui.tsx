import type { ButtonHTMLAttributes, ReactNode } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  ChartColumn,
  House,
  Menu,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Situacao } from "../data/mock";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function CowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M7 6.5C5.8 6 5 5 5 3.8c1.4.2 2.4.9 3 2z" />
    <path d="M17 6.5c1.2-.5 2-1.5 2-2.7-1.4.2-2.4.9-3 2z" />
    <path d="M7.5 8.5C5.5 8 3.2 8.8 2.5 10.3c1.2 1.3 3 1.8 5 1.4z" />
    <path d="M16.5 8.5c2-.5 4.3.3 5 1.8-1.2 1.3-3 1.8-5 1.4z" />
    <path d="M7.5 7.5c1.2-.8 3-1.2 4.5-1.2s3.3.4 4.5 1.2c.5 3 .2 5.5-1 7.5H8.5c-1.2-2-1.5-4.5-1-7.5z" />
    <ellipse cx="12" cy="17.5" rx="4.5" ry="3.5" />
</svg>
 );
}

export function CalfIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
<path d="M7 6.5C5.8 6 5 5 5 3.8c1.4.2 2.4.9 3 2" />
<path d="M17 6.5c1.2-.5 2-1.5 2-2.7-1.4.2-2.4.9-3 2" />
<path d="M7.5 8.5C5.5 8 3.2 8.8 2.5 10.3c1.2 1.3 3 1.8 5 1.4" />
<path d="M16.5 8.5c2-.5 4.3.3 5 1.8-1.2 1.3-3 1.8-5 1.4" />
<path d="M7.5 7.5c1.2-.8 3-1.2 4.5-1.2s3.300.4 4.500 1.200c.5 3 .2 5.500-1 7.500" />
<path d="M7.5 7.5c-.5 3-.2 5.500 1 7.500" />
<ellipse cx="12" cy="17.500" rx="4.500" ry="3.500" />
<path d="M10.500 17.500v.1M13.500 17.500v.1" />
</svg>
  );
}

export function Logo({
  claro = false,
  icone = true,
}: {
  claro?: boolean;
  icone?: boolean;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 font-semibold",
        claro ? "text-primary-foreground" : "text-primary",
      )}
    >
      {icone && <CowIcon className="size-5" />}
      InseminaAI
    </span>
  );
}

export function Botao({
  children,
  className,
  variante = "primario",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "suave" | "fantasma";
}) {
  return (
    <button
      className={cx(
        "press inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg px-5 text-base font-semibold",
        variante === "primario" && "bg-primary text-primary-foreground hover:opacity-95",
        variante === "suave" && "bg-brand-soft text-primary",
        variante === "fantasma" && "bg-transparent text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Campo({
  rotulo,
  icone,
  opcional,
  children,
}: {
  rotulo: string;
  icone?: ReactNode;
  opcional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-foreground">
        {rotulo}
        {opcional && (
          <span className="font-normal text-muted-foreground">(opcional)</span>
        )}
      </span>
      <div className="flex min-h-12 items-center gap-2.5 rounded-md border border-input bg-card px-3.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
        {icone && <span className="text-muted-foreground">{icone}</span>}
        {children}
      </div>
    </label>
  );
}

export const inputClass =
  "h-12 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground";

export function Cartao({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-border bg-card shadow-(--shadow-card)",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TituloSecao({
  children,
  acao,
}: {
  children: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
      {acao}
    </div>
  );
}

const statusMeta: Record<
  Situacao,
  { label: string; cls: string }
> = {
  prenhe: { label: "Prenhe", cls: "bg-brand-soft text-status-prenhe" },
  pendente: { label: "Pendente", cls: "bg-warning-soft text-status-pendente" },
  vazia: { label: "Vazia", cls: "bg-danger-soft text-status-vazia" },
  sem: { label: "Sem registro", cls: "bg-neutral-soft text-status-sem" },
};

export function Etiqueta({ situacao }: { situacao: Situacao }) {
  const t = statusMeta[situacao];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        t.cls,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {t.label}
    </span>
  );
}

export function AvatarLetra({
  nome,
  situacao,
}: {
  nome: string;
  situacao: Situacao;
}) {
  const t = statusMeta[situacao];
  return (
    <div
      className={cx(
        "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        t.cls,
      )}
    >
      {nome.charAt(0).toUpperCase()}
    </div>
  );
}

export function Vazio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <CowIcon className="size-8" />
      </div>
      <p className="text-base font-semibold text-foreground">{titulo}</p>
      <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}

function Aba({
  to,
  icone: Icone,
  rotulo,
}: {
  to: string;
  icone: LucideIcon;
  rotulo: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "relative flex w-20 shrink-0 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
          isActive ? "text-brand" : "text-muted-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="absolute top-0 hidden h-1 w-8 rounded-b-full bg-brand group-data-[status=active]:block" />
          {isActive && (
            <span className="absolute top-0 h-1 w-8 rounded-b-full bg-brand" />
          )}
          <Icone className="size-6" strokeWidth={1.75} />
          {rotulo}
        </>
      )}
    </NavLink>
  );
}

export function BarraInferior() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-border bg-card/95 backdrop-blur">
      <div className="relative flex items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        <Aba to="/inicio" icone={House} rotulo="Início" />
        <Aba to="/matrizes" icone={Users} rotulo="Matrizes" />
        <div className="w-20 shrink-0" />
        <Aba to="/relatorios" icone={ChartColumn} rotulo="Relatórios" />
        <Aba to="/mais" icone={Menu} rotulo="Mais" />
        <Link
          to="/nova-inseminacao"
          aria-label="Nova inseminação"
          className="press absolute left-1/2 top-0 flex size-14 -translate-x-1/2 -translate-y-1/3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-(--shadow-fab)"
        >
          <Plus className="size-8" strokeWidth={2} />
        </Link>
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  semBarra = false,
}: {
  children: ReactNode;
  semBarra?: boolean;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-background">
      <main className={semBarra ? undefined : "pb-28"}>{children}</main>
      {!semBarra && <BarraInferior />}
    </div>
  );
}

export function CabecalhoVoltar({
  titulo,
  voltar = "/inicio",
}: {
  titulo: string;
  voltar?: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
      <Link
        to={voltar}
        aria-label="Voltar"
        className="press -ml-2 flex size-12 items-center justify-center rounded-full"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <h1 className="text-lg font-semibold">{titulo}</h1>
    </header>
  );
}

export function OndasOvelha() {
  return (
    <svg
      viewBox="0 0 400 140"
      className="pointer-events-none -mx-6 mt-8 block w-[calc(100%+3rem)]"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d="M0 70 Q100 30 200 60 T400 50 V140 H0Z" className="fill-brand-soft" />
      <path
        d="M0 95 Q120 65 240 90 T400 85 V140 H0Z"
        className="fill-brand"
        opacity=".25"
      />
      <path
        d="M0 115 Q140 95 260 112 T400 108 V140 H0Z"
        className="fill-brand"
        opacity=".45"
      />
      <g className="fill-primary" opacity=".7">
        <rect x="290" y="60" width="34" height="16" rx="7" />
        <rect x="318" y="54" width="12" height="11" rx="4" />
        <rect x="294" y="73" width="3" height="10" />
        <rect x="316" y="73" width="3" height="10" />
      </g>
    </svg>
  );
}
