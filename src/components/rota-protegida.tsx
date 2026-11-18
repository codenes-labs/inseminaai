import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { sessaoValida, tocarSessao } from "../lib/auth";

export function RotaProtegida({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!sessaoValida()) {
    return <Navigate to="/entrar" replace state={{ de: location.pathname }} />;
  }
  tocarSessao();
  return children;
}