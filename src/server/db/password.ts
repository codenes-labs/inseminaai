import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function senhaConfere(senha: string, armazenada: string): boolean {
  const [salt, hashHex] = armazenada.split(":");
  if (!salt || !hashHex) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const calculado = scryptSync(senha, salt, KEY_LENGTH);
  if (esperado.length !== calculado.length) return false;
  return timingSafeEqual(esperado, calculado);
}