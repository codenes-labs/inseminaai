import { apiFetch } from "../../../lib/api-client";

export async function alterarSenhaApi(
  senhaAtual: string,
  senhaNova: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const response = await apiFetch("/api/auth/change-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      current_password: senhaAtual,
      new_password: senhaNova,
    }),
  });
  if (!response.ok) {
    try {
      const body = (await response.json()) as { error?: string };
      return { ok: false, erro: body.error ?? "Não foi possível alterar a senha." };
    } catch {
      return { ok: false, erro: "Não foi possível alterar a senha." };
    }
  }
  return { ok: true };
}