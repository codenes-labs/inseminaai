import { PublicSiteChrome } from "../../components/public-site-chrome";
import { SITE_PUBLICO_URL } from "../../lib/site-publico";
import { PublicArticle, PublicSecao } from "./PublicArticle";

const ATUALIZADO = "20 de novembro de 2026";

const CHANGELOG = [
  {
    data: "2026-11",
    texto:
      "Landing pública, termos e privacidade; app mobile com matrizes, inseminações, diagnósticos, relatórios (CSV/PDF), offline e configurações.",
  },
  {
    data: "2026-11",
    texto: "Plataforma JWT, API no Worker, Postgres (Neon) com isolamento por cadastro.",
  },
] as const;

export function DocsOverviewPage() {
  return (
    <PublicSiteChrome>
      <PublicArticle titulo="Documentação" atualizadoEm={ATUALIZADO}>
        <PublicSecao titulo="Sobre o produto">
          <p>
            O <strong>Insemina aí</strong> é um PWA para inseminadores registrarem matrizes,
            tentativas, diagnósticos e repetições pelo celular, com previsões de datas, dashboard,
            exportação e funcionamento offline com sincronização posterior.
          </p>
        </PublicSecao>
        <PublicSecao titulo="Stack (resumo)">
          <ul>
            <li>
              <strong>Front-end:</strong> React, Vite, TypeScript, Tailwind, PWA.
            </li>
            <li>
              <strong>API e hospedagem:</strong> Cloudflare Worker servindo SPA e rotas{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">/api/*</code>.
            </li>
            <li>
              <strong>Banco:</strong> PostgreSQL (Neon em produção; Docker local no desenvolvimento).
            </li>
            <li>
              <strong>Auth:</strong> JWT; cada usuário pertence a um cadastro isolado (
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">cadastro_id</code>).
            </li>
          </ul>
        </PublicSecao>
        <PublicSecao titulo="Segurança">
          <p>
            Dados de um cadastro não são acessíveis por usuários de outro cadastro. Regras de
            negócio de datas (diagnóstico, parto, tentativas) ficam no domínio da aplicação.
          </p>
        </PublicSecao>
        <PublicSecao titulo="Deploy e saúde">
          <p>
            Produção em{" "}
            <a href={SITE_PUBLICO_URL} className="font-medium text-primary hover:underline">
              {SITE_PUBLICO_URL}
            </a>
            . Verificação técnica: rota{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">GET /api/health</code>{" "}
            (status do banco e da configuração JWT).
          </p>
        </PublicSecao>
        <PublicSecao titulo="Documentação interna (repositório)">
          <p>
            Desenvolvedores e operadores encontram detalhes em{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">docs/arquitetura.md</code>
            ,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">docs/banco.md</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">docs/deploy-cloudflare.md</code>{" "}
            e nas especificações em{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">docs/specs/</code>.
          </p>
        </PublicSecao>
        <PublicSecao titulo="Changelog público (resumo)">
          <ul>
            {CHANGELOG.map((item) => (
              <li key={item.data + item.texto.slice(0, 24)}>
                <strong className="text-foreground">{item.data}</strong> — {item.texto}
              </li>
            ))}
          </ul>
        </PublicSecao>
        <PublicSecao titulo="Próxima fase (planejada)">
          <p>
            Painel <strong>web</strong> (layout desktop) para administração do cadastro e{" "}
            <strong>criação de usuários</strong> convidados ao mesmo cadastro — padrão semelhante ao
            In House Bank. Perfis e permissões finas ficam para etapa posterior. Ver{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              docs/specs/SPEC-20-painel-web-usuarios.md
            </code>
            .
          </p>
        </PublicSecao>
      </PublicArticle>
    </PublicSiteChrome>
  );
}