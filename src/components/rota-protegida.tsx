import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { normalizarRotaLegada } from "../features/auth/domain/normalizar-rota-legada";
import { plataformaEmModoApp } from "../domain/auth/plataforma-modo-app";
import { lerSessao, sessaoValida, tocarSessao } from "../lib/auth";

export function RotaProtegida({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!sessaoValida()) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{ de: normalizarRotaLegada(location.pathname) }}
      />
    );
  }
  const sessao = lerSessao();
  if (sessao?.plataformaAdmin && !plataformaEmModoApp()) {
    return <Navigate to="/admin/cadastros" replace />;
  }
  tocarSessao();
  return children;
}