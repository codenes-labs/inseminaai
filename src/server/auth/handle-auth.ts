import { autenticarSeed, usuarioPorId } from "./account-seed";
import { emitirToken, verificarToken } from "./jwt";
import {
  JWT_TTL_SECONDS,
  MENSAGEM_CREDENCIAIS_INVALIDAS,
  type AuthUser,
} from "./types";

export type AuthHandlerContext = {
  jwtSecret: string;
};

type SignInBody = {
  email?: string;
  password?: string;
};

function usuarioDaSessao(payload: {
  sub: string;
  email: string;
  nome: string;
  cadastro_id: string;
  papel: AuthUser["papel"];
  demo: boolean;
}): AuthUser {
  return {
    id: payload.sub,
    email: payload.email,
    nome: payload.nome,
    cadastroId: payload.cadastro_id,
    papel: payload.papel,
    demo: payload.demo,
  };
}

function respostaUsuario(usuario: AuthUser) {
  return {
    email: usuario.email,
    nome: usuario.nome,
    cadastro_id: usuario.cadastroId,
    papel: usuario.papel,
    demo: usuario.demo,
  };
}

export async function handleAuthRequest(
  request: Request,
  context: AuthHandlerContext,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/auth")) {
    return null;
  }

  const secret = context.jwtSecret.trim();
  if (!secret || secret.length < 32) {
    return Response.json(
      { error: "Autenticação não configurada." },
      { status: 503 },
    );
  }

  if (url.pathname === "/api/auth/sign-in" && request.method === "POST") {
    let body: SignInBody;
    try {
      body = (await request.json()) as SignInBody;
    } catch {
      return Response.json(
        { error: MENSAGEM_CREDENCIAIS_INVALIDAS },
        { status: 400 },
      );
    }
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    if (!email || !password) {
      return Response.json(
        { error: MENSAGEM_CREDENCIAIS_INVALIDAS },
        { status: 401 },
      );
    }
    const usuario = autenticarSeed(email, password);
    if (!usuario) {
      return Response.json(
        { error: MENSAGEM_CREDENCIAIS_INVALIDAS },
        { status: 401 },
      );
    }
    const token = emitirToken(usuario, secret);
    const now = Math.floor(Date.now() / 1000);
    return Response.json({
      token,
      expires_at: now + JWT_TTL_SECONDS,
      user: respostaUsuario(usuario),
    });
  }

  if (url.pathname === "/api/auth/session" && request.method === "GET") {
    const authorization = request.headers.get("authorization") ?? "";
    const prefix = "Bearer ";
    if (!authorization.startsWith(prefix)) {
      return Response.json({ error: "Não autorizado." }, { status: 401 });
    }
    const token = authorization.slice(prefix.length).trim();
    const payload = verificarToken(token, secret);
    if (!payload) {
      return Response.json({ error: "Não autorizado." }, { status: 401 });
    }
    const seed = usuarioPorId(payload.sub);
    const usuario = seed ?? usuarioDaSessao(payload);
    return Response.json({
      user: respostaUsuario(usuario),
      expires_at: payload.exp,
    });
  }

  if (url.pathname === "/api/auth/sign-out" && request.method === "POST") {
    return new Response(null, { status: 204 });
  }

  return Response.json({ error: "Não encontrado." }, { status: 404 });
}