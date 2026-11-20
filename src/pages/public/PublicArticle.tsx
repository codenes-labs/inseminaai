import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SITE_PUBLICO_ROTULO } from "../../lib/site-publico";

export function PublicArticle({
  titulo,
  atualizadoEm,
  children,
}: {
  titulo: string;
  atualizadoEm: string;
  children: ReactNode;
}) {
  return (
    <article className="mt-8 max-w-3xl space-y-6 text-sm leading-relaxed sm:text-[15px]">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">{titulo}</h1>
        <p className="text-sm text-muted-foreground">
          Última atualização: {atualizadoEm}. Produto{" "}
          <strong className="font-semibold text-foreground">{SITE_PUBLICO_ROTULO}</strong>.
        </p>
      </header>
      <div className="space-y-8">{children}</div>
      <p className="pt-2">
        <Link to="/" className="font-semibold text-primary hover:underline">
          Voltar ao início
        </Link>
      </p>
    </article>
  );
}

export function PublicSecao({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">{titulo}</h2>
      <div className="space-y-2 text-muted-foreground [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}