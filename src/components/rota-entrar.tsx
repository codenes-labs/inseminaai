import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { sessaoValida } from "../lib/auth";

export function RotaEntrar({ children }: { children: ReactNode }) {
  const location = useLocation();
  const destino =
    (location.state as { de?: string } | null)?.de ?? "/inicio";
  if (sessaoValida()) {
    return <Navigate to={destino} replace />;
  }
  return children;
}