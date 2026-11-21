import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { plataformaEmModoApp } from "../domain/auth/plataforma-modo-app";
import { lerSessao, sessaoValida } from "../lib/auth";
import { normalizarRotaLegada } from "../features/auth/domain/normalizar-rota-legada";
import { resolverDestinoPosLogin } from "../features/auth/domain/resolver-destino-pos-login";

export function RotaEntrar({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (sessaoValida()) {
    const sessao = lerSessao();
    if (sessao?.plataformaAdmin && !plataformaEmModoApp()) {
      return <Navigate to="/admin/cadastros" replace />;
    }
    const deBruto = (location.state as { de?: string } | null)?.de;
    const destino = normalizarRotaLegada(
      deBruto ??
        resolverDestinoPosLogin(
          { plataformaAdmin: sessao!.plataformaAdmin, papel: sessao!.papel },
          "app",
          { modoAppPlataforma: plataformaEmModoApp() },
        ),
    );
    return <Navigate to={destino} replace />;
  }
  return children;
}