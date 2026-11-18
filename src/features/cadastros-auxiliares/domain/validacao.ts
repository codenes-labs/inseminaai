export const ERRO_NOME_OBRIGATORIO = "Informe o nome.";

export function validarNomeCadastro(nome: string): string | null {
  if (!nome.trim()) {
    return ERRO_NOME_OBRIGATORIO;
  }
  return null;
}

export function filtrarAtivos<T extends { ativo: boolean }>(
  itens: T[],
  somenteAtivos: boolean,
): T[] {
  if (!somenteAtivos) return itens;
  return itens.filter((item) => item.ativo);
}