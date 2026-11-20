const ALFABETO =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";

/** Gera senha aleatória legível (estilo sugestão bancária). */
export function gerarSenhaSugerida(comprimento = 12): string {
  if (comprimento < 8) {
    throw new Error("Comprimento mínimo é 8.");
  }
  const bytes = new Uint8Array(comprimento);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

export function senhaNovaValida(senha: string): boolean {
  return senha.length >= 8;
}