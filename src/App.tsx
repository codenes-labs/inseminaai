import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Diagnostico } from "./pages/Diagnostico";
import { Inicio } from "./pages/Inicio";
import { Login } from "./pages/Login";
import { Mais } from "./pages/Mais";
import { MatrizDetalhe } from "./pages/MatrizDetalhe";
import { Matrizes } from "./pages/Matrizes";
import { NovaInseminacao } from "./pages/NovaInseminacao";
import { Relatorios } from "./pages/Relatorios";
import { lerSessao } from "./lib/auth";

function Protegido() {
  if (!lerSessao()) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<Protegido />}>
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/matrizes" element={<Matrizes />} />
        <Route path="/matrizes/:id" element={<MatrizDetalhe />} />
        <Route path="/matrizes/:id/diagnostico" element={<Diagnostico />} />
        <Route path="/nova-inseminacao" element={<NovaInseminacao />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/mais" element={<Mais />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
