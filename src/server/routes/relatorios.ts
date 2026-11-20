import type { AuthUser } from "../auth/types";
import {
  exportarInseminacoesCsv,
  obterResumoRelatorios,
} from "../repositories/relatorios-repository";

export async function handleRelatoriosRequest(
  request: Request,
  context: { databaseUrl: string; usuario: AuthUser },
): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname === "/api/relatorios/resumo" && request.method === "GET") {
    const hoje =
      url.searchParams.get("hoje")?.match(/^\d{4}-\d{2}-\d{2}$/) ?
        url.searchParams.get("hoje")!
      : new Date().toISOString().slice(0, 10);
    const resumo = await obterResumoRelatorios(
      context.databaseUrl,
      context.usuario.cadastroId,
      hoje,
    );
    return Response.json(resumo);
  }

  if (
    url.pathname === "/api/relatorios/inseminacoes.csv" &&
    request.method === "GET"
  ) {
    const csv = await exportarInseminacoesCsv(
      context.databaseUrl,
      context.usuario.cadastroId,
    );
    const bom = "\uFEFF";
    return new Response(bom + csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition":
          'attachment; filename="inseminaai-inseminacoes.csv"',
      },
    });
  }

  return null;
}