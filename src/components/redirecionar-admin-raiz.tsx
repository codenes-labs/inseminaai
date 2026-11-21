import { Navigate } from "react-router-dom";
import { ehAdminPlataformaCodenes } from "../domain/auth/admin-plataforma-codenes";
import { lerSessao, sessaoValida } from "../lib/auth";

/** `/admin` sem sufixo → painel ou login da plataforma (não a landing). */
export function RedirecionarAdminRaiz() {
  const sessao = lerSessao();
  if (sessaoValida() && ehAdminPlataformaCodenes(sessao)) {
    return <Navigate to="/admin/cadastros" replace />;
  }
  return <Navigate to="/admin/entrar" replace />;
}