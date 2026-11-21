import { limparSessao } from "./auth";

export function redirecionarLoginAposSessaoInvalida(caminhoApi: string): void {
  limparSessao();
  const destino = caminhoApi.startsWith("/api/plataforma")
    ? "/admin/entrar"
    : "/entrar";
  window.location.assign(destino);
}