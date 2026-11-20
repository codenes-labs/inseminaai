import { PublicSiteChrome } from "../../components/public-site-chrome";
import { SITE_PUBLICO_URL } from "../../lib/site-publico";
import { PublicArticle, PublicSecao } from "./PublicArticle";

const ATUALIZADO = "20 de novembro de 2026";

export function TermsPage() {
  return (
    <PublicSiteChrome>
      <PublicArticle titulo="Termos de uso" atualizadoEm={ATUALIZADO}>
        <PublicSecao titulo="1. Aceite">
          <p>
            Ao criar conta ou usar o <strong>Insemina aí</strong>, você concorda com estes
            termos. Se não concordar, não utilize o serviço.
          </p>
        </PublicSecao>
        <PublicSecao titulo="2. O serviço">
          <p>
            O Insemina aí é um aplicativo web (PWA) para registro de inseminações, diagnósticos,
            repetições e relatórios de matrizes bovinas, voltado principalmente a inseminadores
            autônomos e equipes de campo. O endereço público do serviço é{" "}
            <a href={SITE_PUBLICO_URL} className="font-medium text-primary hover:underline">
              {SITE_PUBLICO_URL}
            </a>
            .
          </p>
        </PublicSecao>
        <PublicSecao titulo="3. Conta e cadastro">
          <p>
            O acesso é feito com e-mail ou telefone e senha. Cada usuário pertence a um{" "}
            <strong>cadastro</strong> (espaço de dados isolado). Você é responsável por manter a
            senha em sigilo e por toda atividade realizada na sua conta.
          </p>
        </PublicSecao>
        <PublicSecao titulo="4. Uso adequado">
          <ul>
            <li>Informar dados verdadeiros no limite do seu conhecimento profissional.</li>
            <li>Não tentar acessar dados de outro cadastro ou contornar controles de segurança.</li>
            <li>
              Não usar o serviço para fins ilegais ou que violem direitos de terceiros.
            </li>
          </ul>
        </PublicSecao>
        <PublicSecao titulo="5. Seus dados">
          <p>
            Os registros de matrizes, inseminações e relatórios que você insere permanecem sob sua
            responsabilidade profissional e vinculados ao seu cadastro. O tratamento de dados
            pessoais está descrito na{" "}
            <a href="/privacidade" className="font-medium text-primary hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </PublicSecao>
        <PublicSecao titulo="6. Disponibilidade e offline">
          <p>
            O app foi pensado para funcionar em campo, inclusive com registro local quando não há
            internet, com sincronização quando a conexão voltar. Não garantimos disponibilidade
            ininterrupta; manutenções e falhas de rede podem afetar o acesso temporariamente.
          </p>
        </PublicSecao>
        <PublicSecao titulo="7. Natureza do serviço">
          <p>
            O Insemina aí é uma ferramenta de registro e organização. Ele{" "}
            <strong>não substitui</strong> diagnóstico veterinário, decisão zootécnica ou
            procedimentos de reprodução realizados no animal. Previsões de datas seguem regras
            configuradas no sistema e podem ser ajustadas conforme a prática da propriedade.
          </p>
        </PublicSecao>
        <PublicSecao titulo="8. Encerramento">
          <p>
            Você pode deixar de usar o serviço a qualquer momento. Podemos suspender ou encerrar
            contas que violem estes termos ou que representem risco à segurança do serviço.
          </p>
        </PublicSecao>
        <PublicSecao titulo="9. Alterações">
          <p>
            Estes termos podem ser atualizados. A data no topo da página indica a versão vigente.
            O uso continuado após alterações constitui aceite da nova versão.
          </p>
        </PublicSecao>
        <PublicSecao titulo="10. Lei aplicável">
          <p>
            Aplica-se a legislação brasileira. Dúvidas sobre estes termos podem ser tratadas pelo
            canal de privacidade indicado na política de privacidade.
          </p>
        </PublicSecao>
      </PublicArticle>
    </PublicSiteChrome>
  );
}