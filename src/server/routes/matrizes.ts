import type { AuthUser } from "../auth/types";
import {
  ErroMatrizDomain,
  atualizarMatriz,
  criarMatriz,
  listarMatrizesAtivas,
  obterMatriz,
} from "../repositories/matrizes-repository";

export type MatrizApiItem = {
  id: string;
  nome: string;
  brinco: string;
  raca: string | null;
  observacoes: string | null;
  situacao: "sem";
  ultimaInseminacao: null;
  ativa: boolean;
};

function paraApi(matriz: {
  id: string;
  nome: string;
  brinco: string | null;
  raca: string | null;
  observacoes?: string | null;
  ativa: boolean;
}): MatrizApiItem {
  return {
    id: matriz.id,
    nome: matriz.nome,
    brinco: matriz.brinco ?? "",
    raca: matriz.raca,
    observacoes: matriz.observacoes ?? null,
    situacao: "sem",
    ultimaInseminacao: null,
    ativa: matriz.ativa,
  };
}

import { bloqueiaDemo } from "./demo-guard";

export async function handleMatrizesRequest(
  request: Request,
  context: { databaseUrl: string; usuario: AuthUser },
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/matrizes")) {
    return null;
  }

  const { databaseUrl, usuario } = context;
  const cadastroId = usuario.cadastroId;
  const partes = url.pathname.split("/").filter(Boolean);

  if (partes.length === 2 && request.method === "GET") {
    const consulta = url.searchParams.get("q") ?? undefined;
    const matrizes = await listarMatrizesAtivas(
      databaseUrl,
      cadastroId,
      consulta ?? undefined,
    );
    return Response.json({
      matrizes: matrizes.map(paraApi),
    });
  }

  if (partes.length === 3 && partes[2] && request.method === "GET") {
    const matriz = await obterMatriz(databaseUrl, cadastroId, partes[2]);
    if (!matriz) {
      return Response.json({ error: "Matriz não encontrada." }, { status: 404 });
    }
    return Response.json({ matriz: paraApi(matriz) });
  }

  if (partes.length === 2 && request.method === "POST") {
    const demo = bloqueiaDemo(usuario);
    if (demo) return demo;
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Corpo inválido." }, { status: 400 });
    }
    try {
      const criada = await criarMatriz(databaseUrl, cadastroId, {
        nome: String(body.nome ?? ""),
        brinco:
          body.brinco == null || body.brinco === ""
            ? null
            : String(body.brinco),
        raca: body.raca == null ? null : String(body.raca),
        observacoes:
          body.observacoes == null ? null : String(body.observacoes),
      });
      return Response.json({ matriz: paraApi(criada) }, { status: 201 });
    } catch (erro) {
      return respostaErroMatriz(erro);
    }
  }

  if (partes.length === 3 && partes[2] && request.method === "PATCH") {
    const demo = bloqueiaDemo(usuario);
    if (demo) return demo;
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Corpo inválido." }, { status: 400 });
    }
    try {
      const atualizada = await atualizarMatriz(databaseUrl, cadastroId, partes[2], {
        nome: body.nome !== undefined ? String(body.nome) : undefined,
        brinco:
          body.brinco !== undefined
            ? body.brinco == null || body.brinco === ""
              ? null
              : String(body.brinco)
            : undefined,
        raca: body.raca !== undefined ? (body.raca == null ? null : String(body.raca)) : undefined,
        observacoes:
          body.observacoes !== undefined
            ? body.observacoes == null
              ? null
              : String(body.observacoes)
            : undefined,
        ativa: typeof body.ativa === "boolean" ? body.ativa : undefined,
      });
      return Response.json({ matriz: paraApi(atualizada) });
    } catch (erro) {
      return respostaErroMatriz(erro);
    }
  }

  return null;
}

function respostaErroMatriz(erro: unknown): Response {
  if (erro instanceof ErroMatrizDomain) {
    const status =
      erro.codigo === "nao_encontrada"
        ? 404
        : erro.codigo === "duplicado"
          ? 409
          : 400;
    return Response.json({ error: erro.message }, { status });
  }
  throw erro;
}