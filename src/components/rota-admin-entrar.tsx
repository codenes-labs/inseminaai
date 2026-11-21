import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { lerSessao, sessaoValida } from "../lib/auth";

export function RotaAdminEntrar({ children }: { children: ReactNode }) {
  const sessao = lerSessao();
  if (sessaoValida() && sessao?.plataformaAdmin) {
    return <Navigate to="/admin/cadastros" replace />;
  }
  return children;
}