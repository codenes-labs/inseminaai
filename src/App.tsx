import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { RotaEntrar } from "./components/rota-entrar";
import { RotaProtegida } from "./components/rota-protegida";
import { Diagnostico } from "./pages/Diagnostico";
import { Inicio } from "./pages/Inicio";
import { Login } from "./pages/Login";
import { CadastroAuxiliarForm } from "./pages/CadastroAuxiliarForm";
import { CadastroAuxiliarLista } from "./pages/CadastroAuxiliarLista";
import { ImportarCsv } from "./pages/ImportarCsv";
import { Mais } from "./pages/Mais";
import { MatrizDetalhe } from "./pages/MatrizDetalhe";
import { MatrizForm } from "./pages/MatrizForm";
import { Matrizes } from "./pages/Matrizes";
import { InseminacaoLote } from "./pages/InseminacaoLote";
import { NovaInseminacao } from "./pages/NovaInseminacao";
import { Relatorios } from "./pages/Relatorios";
import { LandingPage } from "./pages/landing-page";
import {
  DocsOverviewPage,
  PrivacyPage,
  TermsPage,
} from "./pages/public-stub-pages";

function comProtecao(element: ReactElement) {
  return <RotaProtegida>{element}</RotaProtegida>;
}

export function App() {
  return (
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
      <Route path="/termos" element={<TermsPage />} />
      <Route path="/privacidade" element={<PrivacyPage />} />
      <Route path="/docs" element={<DocsOverviewPage />} />
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
  );
}