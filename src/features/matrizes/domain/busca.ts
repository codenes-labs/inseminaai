/** Remove acentos para comparação de busca (SPEC-02). */
export function normalizarTextoBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function textoBuscaCoincide(texto: string, consulta: string): boolean {
  const q = normalizarTextoBusca(consulta);
  if (!q) return true;
  return normalizarTextoBusca(texto).includes(q);
}