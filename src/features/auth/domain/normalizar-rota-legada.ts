/** Mapeia bookmarks e `state.de` antigos (`/web/*`) para rotas SPEC-22. */
export function normalizarRotaLegada(destino: string): string {
  if (destino === "/web/usuarios" || destino === "/web") {
    return "/mais/acessos";
  }
  if (destino.startsWith("/web/cadastros")) {
    return destino.replace(/^\/web/, "/admin");
  }
  if (destino.startsWith("/web/")) {
    return "/admin/cadastros";
  }
  return destino;
}