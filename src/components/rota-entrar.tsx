import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { lerSessao, sessaoValida } from "../lib/auth";
import { resolverDestinoPosLogin } from "../features/auth/domain/resolver-destino-pos-login";

export function RotaEntrar({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (sessaoValida()) {
    const sessao = lerSessao();
    if (sessao?.plataformaAdmin) {
      return <Navigate to="/admin/cadastros" replace />;
    }
    const de = (location.state as { de?: string } | null)?.de;
    const destino =
      de ??
      resolverDestinoPosLogin(
        { plataformaAdmin: sessao!.plataformaAdmin, papel: sessao!.papel },
        "app",
      );
    return <Navigate to={destino} replace />;
  }
  return children;
}