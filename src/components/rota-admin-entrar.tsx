import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ehAdminPlataformaCodenes } from "../domain/auth/admin-plataforma-codenes";
import { lerSessao, sessaoValida } from "../lib/auth";

export function RotaAdminEntrar({ children }: { children: ReactNode }) {
  const sessao = lerSessao();
  if (!sessaoValida()) {
    return children;
  }
  if (ehAdminPlataformaCodenes(sessao)) {
    return <Navigate to="/admin/cadastros" replace />;
  }
  return <Navigate to="/inicio" replace />;
}