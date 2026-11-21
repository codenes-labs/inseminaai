import { Navigate, useLocation } from "react-router-dom";
import { normalizarRotaLegada } from "../features/auth/domain/normalizar-rota-legada";

/** Mantém bookmarks antigos de `/web/*` após SPEC-22. */
export function RedirecionarWebLegado() {
  const { pathname } = useLocation();
  return <Navigate to={normalizarRotaLegada(pathname)} replace />;
}