import { resolverPeriodoRelatorio } from "../../features/relatorios/domain/periodo";
import type { AuthUser } from "../auth/types";
import {
  exportarInseminacoesCsv,
  obterResumoRelatorios,
} from "../repositories/relatorios-repository";

function hojeServidor(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

function periodoDaUrl(url: URL) {
  try {
    return resolverPeriodoRelatorio({
      de: url.searchParams.get("de"),
      ate: url.searchParams.get("ate"),
      mes: url.searchParams.get("mes"),
      hoje: url.searchParams.get("hoje") ?? hojeServidor(),
    });
  } catch {
    return null;
  }
}

export async function handleRelatoriosRequest(
  request: Request,
  context: { databaseUrl: string; usuario: AuthUser },
): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname === "/api/relatorios/resumo" && request.method === "GET") {
    const periodo = periodoDaUrl(url);
    if (!periodo) {
      return Response.json({ erro: "Período inválido." }, { status: 400 });
    }
    const resumo = await obterResumoRelatorios(
      context.databaseUrl,
      context.usuario.cadastroId,
      periodo,
    );
    return Response.json(resumo);
  }

  if (
    url.pathname === "/api/relatorios/inseminacoes.csv" &&
    request.method === "GET"
  ) {
    const periodo = periodoDaUrl(url);
    if (!periodo) {
      return Response.json({ erro: "Período inválido." }, { status: 400 });
    }
    const csv = await exportarInseminacoesCsv(
      context.databaseUrl,
      context.usuario.cadastroId,
      periodo,
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