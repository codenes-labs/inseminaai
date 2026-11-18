import type { AuthUser } from "../auth/types";
import {
  ErroInseminacao,
  contextoMatrizInseminacao,
  criarInseminacao,
  ultimoInseminadorId,
} from "../repositories/inseminacoes-repository";
import { bloqueiaDemo } from "./demo-guard";

type Contexto = { databaseUrl: string; usuario: AuthUser };

function hojeLocalIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

function respostaErro(erro: unknown): Response {
  if (erro instanceof ErroInseminacao) {
    const status =
      erro.codigo === "matriz_invalida" ? 404 : 400;
    return Response.json({ error: erro.message }, { status });
  }
  throw erro;
}

export async function handleInseminacoesRequest(
  request: Request,
  context: Contexto,
): Promise<Response | null> {
  const url = new URL(request.url);
  const { databaseUrl, usuario } = context;
  const cadastroId = usuario.cadastroId;

  if (url.pathname === "/api/inseminacoes/ultimo-inseminador" && request.method === "GET") {
    const id = await ultimoInseminadorId(databaseUrl, cadastroId);
    return Response.json({ inseminador_id: id });
  }

  const contextoMatriz = url.pathname.match(
    /^\/api\/matrizes\/([^/]+)\/contexto-inseminacao$/,
  );
  if (contextoMatriz && request.method === "GET") {
    const ctx = await contextoMatrizInseminacao(
      databaseUrl,
      cadastroId,
      contextoMatriz[1],
    );
    return Response.json(ctx);
  }

  if (url.pathname === "/api/inseminacoes" && request.method === "POST") {
    const demo = bloqueiaDemo(usuario);
    if (demo) return demo;
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Corpo inválido." }, { status: 400 });
    }
    try {
      const criada = await criarInseminacao(databaseUrl, cadastroId, {
        matriz_id: String(body.matriz_id ?? ""),
        reprodutor_id: String(body.reprodutor_id ?? ""),
        inseminador_id: String(body.inseminador_id ?? ""),
        lote_id:
          body.lote_id == null || body.lote_id === ""
            ? null
            : String(body.lote_id),
        data: String(body.data ?? ""),
        tipo: String(body.tipo ?? ""),
        observacoes:
          body.observacoes == null ? null : String(body.observacoes),
        hoje: hojeLocalIso(),
      });
      return Response.json({ inseminacao: criada }, { status: 201 });
    } catch (erro) {
      return respostaErro(erro);
    }
  }

  return null;
}