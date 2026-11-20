import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { lerSessao, sessaoValida } from "../lib/auth";

export function RotaWebAdmin({ children }: { children: ReactElement }) {
  if (!sessaoValida()) {
    return <Navigate to="/entrar" replace state={{ de: "/web/usuarios" }} />;
  }
  const sessao = lerSessao();
  if (sessao?.papel !== "administrador") {
    return <Navigate to="/inicio" replace />;
  }
  return children;
}