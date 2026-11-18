import { PublicSiteChrome, PublicStubArticle } from "../components/public-site-chrome";

const STUB =
  "Texto completo em elaboração (SPEC-17). O acesso ao app autenticado será liberado nas sprints de plataforma.";

export function TermsPage() {
  return (
    <PublicSiteChrome>
      <PublicStubArticle titulo="Termos de uso" texto={STUB} />
    </PublicSiteChrome>
  );
}

export function PrivacyPage() {
  return (
    <PublicSiteChrome>
      <PublicStubArticle titulo="Privacidade" texto={STUB} />
    </PublicSiteChrome>
  );
}

export function DocsOverviewPage() {
  return (
    <PublicSiteChrome>
      <PublicStubArticle
        titulo="Documentação"
        texto="Índice da documentação técnica e do produto será publicado aqui (SPEC-17), no mesmo padrão do site público."
      />
    </PublicSiteChrome>
  );
}
