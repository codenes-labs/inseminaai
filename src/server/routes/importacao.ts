import type { AuthUser } from "../auth/types";
import { importarCsv } from "../repositories/importacao-repository";
import { bloqueiaDemo } from "./demo-guard";

export async function handleImportacaoRequest(
  request: Request,
  context: { databaseUrl: string; usuario: AuthUser },
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/importacao/csv" || request.method !== "POST") {
    return null;
  }

  const demo = bloqueiaDemo(context.usuario);
  if (demo) return demo;

  let body: { conteudo?: string };
  try {
    body = (await request.json()) as { conteudo?: string };
  } catch {
    return Response.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const conteudo = body.conteudo?.trim() ?? "";
  if (!conteudo) {
    return Response.json({ error: "Envie o conteúdo do CSV." }, { status: 400 });
  }

  const linhas = conteudo.split("\n").length;
  if (linhas > 5000) {
    return Response.json(
      { error: "Arquivo muito grande (máximo 5000 linhas)." },
      { status: 400 },
    );
  }

  const resultado = await importarCsv(
    context.databaseUrl,
    context.usuario.cadastroId,
    conteudo,
  );

  return Response.json(resultado);
}