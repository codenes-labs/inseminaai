import { responderDemoMock } from "../features/demo/infrastructure/demo-mock-resposta";
import { lerSessao } from "./auth";

export async function apiFetch(
  caminho: string,
  init: RequestInit = {},
): Promise<Response> {
  const sessao = lerSessao();
  if (
    sessao?.demo &&
    caminho.startsWith("/api/") &&
    !caminho.startsWith("/api/auth") &&
    !caminho.startsWith("/api/plataforma")
  ) {
    return responderDemoMock(caminho, init);
  }
  const headers = new Headers(init.headers);
  if (!headers.has("content-type") && init.body) {
    headers.set("content-type", "application/json");
  }
  if (sessao?.token) {
    headers.set("authorization", `Bearer ${sessao.token}`);
  }
  return fetch(caminho, { ...init, headers });
}