import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuthTokenPayload, AuthUser } from "./types";
import { JWT_TTL_SECONDS } from "./types";
import { papelValido } from "./account-seed";

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function emitirToken(usuario: AuthUser, secret: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    sub: usuario.id,
    email: usuario.email,
    nome: usuario.nome,
    cadastro_id: usuario.cadastroId,
    papel: usuario.papel,
    demo: usuario.demo,
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const assinatura = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${assinatura}`;
}

function assinaturaValida(partes: string[], secret: string): boolean {
  const [header, body, assinatura] = partes;
  const esperada = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  const a = Buffer.from(assinatura, "utf8");
  const b = Buffer.from(esperada, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function parsePayload(body: string): AuthTokenPayload | null {
  try {
    const raw = JSON.parse(base64UrlDecode(body)) as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);
    if (
      typeof raw.sub !== "string" ||
      typeof raw.email !== "string" ||
      typeof raw.nome !== "string" ||
      typeof raw.cadastro_id !== "string" ||
      !papelValido(raw.papel) ||
      typeof raw.demo !== "boolean" ||
      typeof raw.iat !== "number" ||
      typeof raw.exp !== "number" ||
      raw.exp <= now
    ) {
      return null;
    }
    return raw as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function verificarToken(
  token: string,
  secret: string,
): AuthTokenPayload | null {
  const partes = token.split(".");
  if (partes.length !== 3 || !assinaturaValida(partes, secret)) {
    return null;
  }
  return parsePayload(partes[1]);
}