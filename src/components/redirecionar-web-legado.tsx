import { Navigate, useLocation } from "react-router-dom";

/** Mantém bookmarks antigos de `/web/*` após SPEC-22. */
export function RedirecionarWebLegado() {
  const { pathname } = useLocation();
  if (pathname === "/web/usuarios" || pathname === "/web") {
    return <Navigate to="/mais/acessos" replace />;
  }
  if (pathname.startsWith("/web/cadastros")) {
    return <Navigate to={pathname.replace(/^\/web/, "/admin")} replace />;
  }
  return <Navigate to="/entrar" replace />;
}