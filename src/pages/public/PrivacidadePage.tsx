import { PublicSiteChrome } from "../../components/public-site-chrome";
import { PublicArticle, PublicSecao } from "./PublicArticle";

const ATUALIZADO = "20 de novembro de 2026";
const CONTATO_PRIVACIDADE = "privacidade@codenes.com.br";

export function PrivacyPage() {
  return (
    <PublicSiteChrome>
      <PublicArticle titulo="Política de Privacidade" atualizadoEm={ATUALIZADO}>
        <PublicSecao titulo="1. Quem somos">
          <p>
            Esta política descreve como o <strong>Insemina aí</strong> trata dados pessoais no
            contexto do aplicativo de registro reprodutivo bovino, em conformidade com a Lei Geral
            de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>
        </PublicSecao>
        <PublicSecao titulo="2. Dados que coletamos">
          <ul>
            <li>
              <strong>Conta:</strong> e-mail ou telefone, senha (armazenada de forma protegida),
              nome do usuário quando informado.
            </li>
            <li>
              <strong>Cadastro:</strong> nome do espaço de trabalho (cadastro), vínculo do usuário
              ao cadastro.
            </li>
            <li>
              <strong>Operação:</strong> matrizes, inseminações, diagnósticos, cadastros
              auxiliares (reprodutores, inseminadores, lotes), observações e datas informadas por
              você.
            </li>
            <li>
              <strong>Técnicos:</strong> registros de sessão (JWT), logs de erro e métricas
              agregadas de uso, quando aplicável à operação do serviço.
            </li>
          </ul>
        </PublicSecao>
        <PublicSecao titulo="3. Finalidade e bases legais">
          <ul>
            <li>
              <strong>Prestação do serviço</strong> — executar o contrato e permitir registro,
              consulta, exportação e sincronização dos seus dados (art. 7º, V, LGPD).
            </li>
            <li>
              <strong>Segurança</strong> — autenticação, isolamento por cadastro, prevenção de
              fraudes e abusos (art. 7º, IX).
            </li>
            <li>
              <strong>Melhoria</strong> — corrigir falhas e evoluir o produto, quando não houver
              impacto desproporcional aos direitos do titular (art. 7º, IX ou legítimo interesse,
              conforme o caso).
            </li>
          </ul>
        </PublicSecao>
        <PublicSecao titulo="4. Compartilhamento">
          <p>
            Não vendemos dados pessoais. Utilizamos provedores de infraestrutura para hospedar o
            aplicativo e o banco de dados (por exemplo, Cloudflare e Neon PostgreSQL), que
            processam dados conforme contratos de suboperador e apenas para operar o serviço.
          </p>
        </PublicSecao>
        <PublicSecao titulo="5. Armazenamento e retenção">
          <p>
            Os dados ficam em servidores com acesso restrito. Mantemos as informações enquanto sua
            conta estiver ativa e conforme obrigações legais. Você pode solicitar esclarecimentos
            sobre exclusão ou anonimização pelo canal abaixo.
          </p>
        </PublicSecao>
        <PublicSecao titulo="6. Segurança">
          <p>
            Aplicamos autenticação por token, segregação lógica por <strong>cadastro_id</strong> no
            banco e políticas de acesso no servidor. Nenhuma medida é absoluta; recomendamos senha
            forte e dispositivo pessoal protegido.
          </p>
        </PublicSecao>
        <PublicSecao titulo="7. Seus direitos (LGPD)">
          <p>Você pode solicitar, conforme a LGPD:</p>
          <ul>
            <li>confirmação do tratamento e acesso aos dados;</li>
            <li>correção de dados incompletos ou desatualizados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>portabilidade, quando aplicável;</li>
            <li>informação sobre compartilhamento e revogação de consentimento, quando couber.</li>
          </ul>
        </PublicSecao>
        <PublicSecao titulo="8. Cookies e armazenamento local">
          <p>
            Usamos armazenamento local do navegador para sessão, tema visual e fila offline de
            sincronização. Não usamos cookies de publicidade de terceiros no app.
          </p>
        </PublicSecao>
        <PublicSecao titulo="9. Alterações">
          <p>
            Esta política pode ser atualizada. A data no topo indica a versão atual. Alterações
            relevantes serão refletidas nesta página.
          </p>
        </PublicSecao>
        <PublicSecao titulo="10. Contato">
          <p>
            Para exercer direitos ou esclarecer dúvidas sobre privacidade:{" "}
            <a
              href={`mailto:${CONTATO_PRIVACIDADE}`}
              className="font-medium text-primary hover:underline"
            >
              {CONTATO_PRIVACIDADE}
            </a>
            .
          </p>
        </PublicSecao>
      </PublicArticle>
    </PublicSiteChrome>
  );
}