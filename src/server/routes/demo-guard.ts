import type { AuthUser } from "../auth/types";

export function bloqueiaDemo(usuario: AuthUser): Response | null {
  if (usuario.demo) {
    return Response.json(
      {
        error:
          "Conta demo não grava no banco. Use o administrador para cadastrar.",
      },
      { status: 403 },
    );
  }
  return null;
}