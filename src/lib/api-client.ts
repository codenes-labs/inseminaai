import { responderDemoMock } from "../features/demo/infrastructure/demo-mock-resposta";
import { lerSessao } from "./auth";
import { redirecionarLoginAposSessaoInvalida } from "./sessao-expirada";

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
  const response = await fetch(caminho, { ...init, headers });
  if (
    response.status === 401 &&
    caminho.startsWith("/api/") &&
    caminho !== "/api/auth/sign-in" &&
    sessao?.token
  ) {
    redirecionarLoginAposSessaoInvalida(caminho);
  }
  return response;
}