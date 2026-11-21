import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { lerSessao, sessaoValida } from "../lib/auth";

export function RotaAcessosCadastro({ children }: { children: ReactElement }) {
  if (!sessaoValida()) {
    return <Navigate to="/entrar" replace state={{ de: "/mais/acessos" }} />;
  }
  const sessao = lerSessao();
  if (sessao?.plataformaAdmin) {
    return <Navigate to="/admin/cadastros" replace />;
  }
  if (sessao?.papel !== "administrador") {
    return <Navigate to="/inicio" replace />;
  }
  return children;
}