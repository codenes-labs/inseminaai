export const ERRO_NOME_OBRIGATORIO = "Informe o nome da matriz.";
export const ERRO_BRINCO_DUPLICADO =
  "Este brinco já está em uso neste cadastro.";

export function normalizarBrinco(
  brinco: string | null | undefined,
): string | null {
  const limpo = brinco?.trim() ?? "";
  return limpo.length > 0 ? limpo : null;
}

export function validarNomeMatriz(nome: string): string | null {
  if (!nome.trim()) {
    return ERRO_NOME_OBRIGATORIO;
  }
  return null;
}

export function brincoDuplicadoNoCadastro(
  brinco: string | null,
  existentes: { brinco: string | null; id?: string }[],
  excluirId?: string,
): boolean {
  if (!brinco) return false;
  const alvo = brinco.trim().toLowerCase();
  return existentes.some((item) => {
    if (excluirId && item.id === excluirId) return false;
    const outro = item.brinco?.trim().toLowerCase();
    return outro === alvo;
  });
}