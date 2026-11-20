import type { AuthUser } from "../auth/types";
import { obterDashboard } from "../repositories/dashboard-repository";

export async function handleDashboardRequest(
  request: Request,
  context: { databaseUrl: string; usuario: AuthUser },
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/dashboard" || request.method !== "GET") {
    return null;
  }

  const hojeParam = url.searchParams.get("hoje");
  const hoje =
    hojeParam && /^\d{4}-\d{2}-\d{2}$/.test(hojeParam)
      ? hojeParam
      : new Date().toISOString().slice(0, 10);

  const dados = await obterDashboard(
    context.databaseUrl,
    context.usuario.cadastroId,
    hoje,
  );
  return Response.json(dados);
}