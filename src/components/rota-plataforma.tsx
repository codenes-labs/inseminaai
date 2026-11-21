import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { ehAdminPlataformaCodenes } from "../domain/auth/admin-plataforma-codenes";
import { lerSessao, sessaoValida } from "../lib/auth";

export function RotaPlataforma({ children }: { children: ReactElement }) {
  if (!sessaoValida()) {
    return <Navigate to="/admin/entrar" replace state={{ de: "/admin/cadastros" }} />;
  }
  const sessao = lerSessao();
  if (!ehAdminPlataformaCodenes(sessao)) {
    return <Navigate to="/inicio" replace />;
  }
  return children;
}