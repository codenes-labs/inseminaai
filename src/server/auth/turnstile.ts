const URL_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verificarTurnstile(
  secret: string,
  token: string,
): Promise<boolean> {
  const body = new URLSearchParams({
    secret: secret.trim(),
    response: token.trim(),
  });
  const response = await fetch(URL_VERIFY, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    return false;
  }
  const json = (await response.json()) as { success?: boolean };
  return json.success === true;
}