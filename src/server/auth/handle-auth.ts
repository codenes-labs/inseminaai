import { emitirToken, verificarToken } from "./jwt";
import {
  autenticarCredenciais,
  bearerToken,
  usuarioDoToken,
} from "./resolve-user";
import {
  JWT_TTL_SECONDS,
  MENSAGEM_CREDENCIAIS_INVALIDAS,
  type AuthUser,
} from "./types";
import { senhaNovaValida } from "../../features/conta/domain/gerar-senha";
import {
  atualizarSenhaNoBanco,
  senhaAtualConfereNoBanco,
} from "../repositories/users-repository";
import { verificarTurnstile } from "./turnstile";

export type AuthHandlerContext = {
  jwtSecret: string;
  databaseUrl?: string;
  turnstileSecretKey?: string;
};

type SignInBody = {
  email?: string;
  password?: string;
  turnstile_token?: string;
};

type ChangePasswordBody = {
  current_password?: string;
  new_password?: string;
};

function respostaUsuario(usuario: AuthUser) {
  return {
    email: usuario.email,
    nome: usuario.nome,
    cadastro_id: usuario.cadastroId,
    papel: usuario.papel,
    demo: usuario.demo,
    plataforma_admin: usuario.plataformaAdmin,
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
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password?.trim() ?? "";
    if (!email || !password) {
      return Response.json(
        { error: MENSAGEM_CREDENCIAIS_INVALIDAS },
        { status: 401 },
      );
    }
    const turnstileSecret = context.turnstileSecretKey?.trim();
    if (turnstileSecret) {
      const tokenCaptcha = body.turnstile_token?.trim() ?? "";
      if (!tokenCaptcha) {
        return Response.json(
          { error: "Confirme o captcha antes de entrar." },
          { status: 400 },
        );
      }
      const captchaOk = await verificarTurnstile(turnstileSecret, tokenCaptcha);
      if (!captchaOk) {
        return Response.json({ error: "Captcha inválido." }, { status: 403 });
      }
    }
    let usuario: Awaited<ReturnType<typeof autenticarCredenciais>>;
    try {
      usuario = await autenticarCredenciais(
        email,
        password,
        context.databaseUrl,
      );
    } catch (erro) {
      console.error("[auth] falha no sign-in (banco)", erro);
      return Response.json(
        { error: "Serviço temporariamente indisponível. Tente de novo." },
        { status: 503 },
      );
    }
    if (!usuario) {
      console.error("[auth] credenciais recusadas", { email });
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
    const token = bearerToken(request);
    if (!token) {
      return Response.json({ error: "Não autorizado." }, { status: 401 });
    }
    const usuario = await usuarioDoToken(token, secret, context.databaseUrl);
    if (!usuario) {
      return Response.json({ error: "Não autorizado." }, { status: 401 });
    }
    const claims = verificarToken(token, secret);
    return Response.json({
      user: respostaUsuario(usuario),
      expires_at: claims?.exp ?? 0,
    });
  }

  if (url.pathname === "/api/auth/sign-out" && request.method === "POST") {
    return new Response(null, { status: 204 });
  }

  if (
    url.pathname === "/api/auth/change-password" &&
    request.method === "POST"
  ) {
    const databaseUrl = context.databaseUrl?.trim();
    if (!databaseUrl) {
      return Response.json(
        { error: "Alteração de senha indisponível neste ambiente." },
        { status: 503 },
      );
    }
    const token = bearerToken(request);
    if (!token) {
      return Response.json({ error: "Não autorizado." }, { status: 401 });
    }
    const usuario = await usuarioDoToken(token, secret, databaseUrl);
    if (!usuario) {
      return Response.json({ error: "Não autorizado." }, { status: 401 });
    }
    let body: ChangePasswordBody;
    try {
      body = (await request.json()) as ChangePasswordBody;
    } catch {
      return Response.json({ error: "Dados inválidos." }, { status: 400 });
    }
    const atual = body.current_password ?? "";
    const nova = body.new_password ?? "";
    if (!atual || !nova) {
      return Response.json(
        { error: "Informe a senha atual e a nova senha." },
        { status: 400 },
      );
    }
    if (!senhaNovaValida(nova)) {
      return Response.json(
        { error: "A nova senha deve ter pelo menos 8 caracteres." },
        { status: 400 },
      );
    }
    const confere = await senhaAtualConfereNoBanco(
      databaseUrl,
      usuario.id,
      atual,
    );
    if (!confere) {
      return Response.json({ error: "Senha atual incorreta." }, { status: 401 });
    }
    const atualizou = await atualizarSenhaNoBanco(
      databaseUrl,
      usuario.id,
      nova,
    );
    if (!atualizou) {
      return Response.json(
        { error: "Não foi possível alterar a senha." },
        { status: 500 },
      );
    }
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Não encontrado." }, { status: 404 });
}