import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { lerSessao, sessaoValida } from "../lib/auth";

export function RotaPlataforma({ children }: { children: ReactElement }) {
  if (!sessaoValida()) {
    return <Navigate to="/entrar" replace state={{ de: "/web/cadastros" }} />;
  }
  const sessao = lerSessao();
  if (!sessao?.plataformaAdmin) {
    return <Navigate to="/inicio" replace />;
  }
  return children;
}