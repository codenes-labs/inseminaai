import { MENSAGEM_LOGIN_INVALIDO } from "./auth-types";

export type SignInResponse = {
  token: string;
  expires_at: number;
  user: {
    email: string;
    nome: string;
    cadastro_id: string;
    papel: "administrador" | "inseminador";
    demo: boolean;
  };
};

export async function apiSignIn(
  email: string,
  password: string,
  turnstileToken?: string,
): Promise<
  | { ok: true; data: SignInResponse }
  | { ok: false; error: string }
> {
  const payload: Record<string, string> = { email, password };
  if (turnstileToken?.trim()) {
    payload.turnstile_token = turnstileToken.trim();
  }
  const response = await fetch("/api/auth/sign-in", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    try {
      const body = (await response.json()) as { error?: string };
      return { ok: false, error: body.error ?? MENSAGEM_LOGIN_INVALIDO };
    } catch {
      return { ok: false, error: MENSAGEM_LOGIN_INVALIDO };
    }
  }
  const data = (await response.json()) as SignInResponse;
  return { ok: true, data };
}

export async function apiSignOut(): Promise<void> {
  await fetch("/api/auth/sign-out", { method: "POST" });
}