import {
  autenticarSeed,
  usuarioPorId as usuarioSeedPorId,
} from "./account-seed";
import {
  autenticarNoBanco,
  usuarioPorIdNoBanco,
} from "../repositories/users-repository";
import type { AuthUser } from "./types";
import { verificarToken } from "./jwt";
import { papelValido } from "./account-seed";

function mapUsuario(usuario: {
  id: string;
  email: string;
  nome: string;
  cadastroId: string;
  papel: AuthUser["papel"];
  demo: boolean;
  plataformaAdmin: boolean;
}): AuthUser {
  return usuario;
}

function usuarioDoPayload(payload: {
  sub: string;
  email: string;
  nome: string;
  cadastro_id: string;
  papel: unknown;
  demo: boolean;
}): AuthUser | null {
  if (!papelValido(payload.papel)) return null;
  return {
    id: payload.sub,
    email: payload.email,
    nome: payload.nome,
    cadastroId: payload.cadastro_id,
    papel: payload.papel,
    demo: payload.demo,
    plataformaAdmin: false,
  };
}

export async function autenticarCredenciais(
  email: string,
  senha: string,
  databaseUrl?: string,
): Promise<AuthUser | null> {
  if (databaseUrl?.trim()) {
    const usuario = await autenticarNoBanco(databaseUrl, email, senha);
    return usuario ? mapUsuario(usuario) : null;
  }
  return autenticarSeed(email, senha);
}

export async function usuarioDoToken(
  token: string,
  jwtSecret: string,
  databaseUrl?: string,
): Promise<AuthUser | null> {
  const payload = verificarToken(token, jwtSecret);
  if (!payload) return null;
  if (databaseUrl?.trim()) {
    const usuario = await usuarioPorIdNoBanco(databaseUrl, payload.sub);
    if (usuario) return mapUsuario(usuario);
  }
  const seed = usuarioSeedPorId(payload.sub);
  if (seed) return seed;
  return usuarioDoPayload({
    sub: payload.sub,
    email: payload.email,
    nome: payload.nome,
    cadastro_id: payload.cadastro_id,
    papel: payload.papel,
    demo: payload.demo,
  });
}

export function bearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!authorization.startsWith(prefix)) return null;
  const token = authorization.slice(prefix.length).trim();
  return token || null;
}