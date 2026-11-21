import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { AvisoFilaOffline } from "./components/aviso-fila-offline";
import { RotaAdminEntrar } from "./components/rota-admin-entrar";
import { RotaEntrar } from "./components/rota-entrar";
import { RotaPlataforma } from "./components/rota-plataforma";
import { RotaAcessosCadastro } from "./components/rota-web-admin";
import { RotaProtegida } from "./components/rota-protegida";
import { RedirecionarWebLegado } from "./components/redirecionar-web-legado";
import { Diagnostico } from "./pages/Diagnostico";
import { Inicio } from "./pages/Inicio";
import { Login } from "./pages/Login";
import { LoginAdmin } from "./pages/LoginAdmin";
import { CadastroAuxiliarForm } from "./pages/CadastroAuxiliarForm";
import { CadastroAuxiliarLista } from "./pages/CadastroAuxiliarLista";
import { AlterarSenha } from "./pages/AlterarSenha";
import { Configuracoes } from "./pages/Configuracoes";
import { ImportarCsv } from "./pages/ImportarCsv";
import { Mais } from "./pages/Mais";
import { MatrizDetalhe } from "./pages/MatrizDetalhe";
import { MatrizForm } from "./pages/MatrizForm";
import { Matrizes } from "./pages/Matrizes";
import { InseminacaoLote } from "./pages/InseminacaoLote";
import { NovaInseminacao } from "./pages/NovaInseminacao";
import { Relatorios } from "./pages/Relatorios";
import { LandingPage } from "./pages/landing-page";
import { DocsOverviewPage } from "./pages/public/DocsOverviewPage";
import { PrivacyPage } from "./pages/public/PrivacidadePage";
import { TermsPage } from "./pages/public/TermosPage";
import { WebCadastroDetalhe } from "./pages/web/WebCadastroDetalhe";
import { WebCadastros } from "./pages/web/WebCadastros";
import { WebUsuarios } from "./pages/web/WebUsuarios";

function comProtecao(element: ReactElement) {
  return <RotaProtegida>{element}</RotaProtegida>;
}

export function App() {
  return (
    <>
      <AvisoFilaOffline />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/entrar"
          element={
            <RotaEntrar>
              <Login />
            </RotaEntrar>
          }
        />
        <Route
          path="/admin/entrar"
          element={
            <RotaAdminEntrar>
              <LoginAdmin />
            </RotaAdminEntrar>
          }
        />
        <Route path="/termos" element={<TermsPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/docs" element={<DocsOverviewPage />} />
        <Route
          path="/admin/cadastros"
          element={
            <RotaPlataforma>
              <WebCadastros />
            </RotaPlataforma>
          }
        />
        <Route
          path="/admin/cadastros/:cadastroId"
          element={
            <RotaPlataforma>
              <WebCadastroDetalhe />
            </RotaPlataforma>
          }
        />
        <Route
          path="/mais/acessos"
          element={
            <RotaAcessosCadastro>
              <WebUsuarios />
            </RotaAcessosCadastro>
          }
        />
        <Route path="/web/*" element={<RedirecionarWebLegado />} />
        <Route path="/inicio" element={comProtecao(<Inicio />)} />
        <Route path="/matrizes" element={comProtecao(<Matrizes />)} />
        <Route path="/matrizes/nova" element={comProtecao(<MatrizForm />)} />
        <Route path="/matrizes/:id/editar" element={comProtecao(<MatrizForm />)} />
        <Route path="/matrizes/:id" element={comProtecao(<MatrizDetalhe />)} />
        <Route
          path="/matrizes/:id/diagnostico"
          element={comProtecao(<Diagnostico />)}
        />
        <Route
          path="/nova-inseminacao"
          element={comProtecao(<NovaInseminacao />)}
        />
        <Route
          path="/inseminacao-lote"
          element={comProtecao(<InseminacaoLote />)}
        />
        <Route path="/relatorios" element={comProtecao(<Relatorios />)} />
        <Route path="/mais/importar" element={comProtecao(<ImportarCsv />)} />
        <Route
          path="/mais/configuracoes"
          element={comProtecao(<Configuracoes />)}
        />
        <Route
          path="/mais/configuracoes/senha"
          element={comProtecao(<AlterarSenha />)}
        />
        <Route
          path="/mais/:tipo/nova"
          element={comProtecao(<CadastroAuxiliarForm />)}
        />
        <Route
          path="/mais/:tipo/:id/editar"
          element={comProtecao(<CadastroAuxiliarForm />)}
        />
        <Route
          path="/mais/:tipo"
          element={comProtecao(<CadastroAuxiliarLista />)}
        />
        <Route path="/mais" element={comProtecao(<Mais />)} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </>
  );
}