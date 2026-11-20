import type { AuthUser } from "../auth/types";
import type { SituacaoMatriz } from "../../features/matrizes/domain/resumo-reprodutivo";
import {
  ErroMatrizDomain,
  atualizarMatriz,
  criarMatriz,
  listarHistoricoMatriz,
  listarMatrizesAtivas,
  obterMatrizComSituacao,
  type MatrizResumoComSituacao,
} from "../repositories/matrizes-repository";
import { bloqueiaDemo } from "./demo-guard";

export type MatrizApiItem = {
  id: string;
  nome: string;
  brinco: string;
  raca: string | null;
  observacoes: string | null;
  situacao: SituacaoMatriz;
  ultimaInseminacao: string | null;
  ativa: boolean;
};

function paraApi(
  matriz: MatrizResumoComSituacao & { observacoes?: string | null },
): MatrizApiItem {
  return {
    id: matriz.id,
    nome: matriz.nome,
    brinco: matriz.brinco ?? "",
    raca: matriz.raca,
    observacoes: matriz.observacoes ?? null,
    situacao: matriz.situacao,
    ultimaInseminacao: matriz.ultimaInseminacao,
    ativa: matriz.ativa,
  };
}

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
    const ativasParam = url.searchParams.get("ativas");
    const somenteAtivos =
      ativasParam === "false" || ativasParam === "0" ? false : true;
    const matrizes = await listarMatrizesAtivas(
      databaseUrl,
      cadastroId,
      consulta ?? undefined,
      somenteAtivos,
    );
    return Response.json({
      matrizes: matrizes.map(paraApi),
    });
  }

  if (
    partes.length === 4 &&
    partes[3] === "historico" &&
    partes[2] &&
    request.method === "GET"
  ) {
    const { historico, repeticoes } = await listarHistoricoMatriz(
      databaseUrl,
      cadastroId,
      partes[2],
    );
    return Response.json({ historico, repeticoes });
  }

  if (partes.length === 3 && partes[2] && request.method === "GET") {
    const matriz = await obterMatrizComSituacao(databaseUrl, cadastroId, partes[2]);
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
      const comSituacao = await obterMatrizComSituacao(
        databaseUrl,
        cadastroId,
        criada.id,
      );
      if (!comSituacao) {
        throw new Error("Falha ao carregar matriz criada.");
      }
      return Response.json({ matriz: paraApi(comSituacao) }, { status: 201 });
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
      await atualizarMatriz(databaseUrl, cadastroId, partes[2], {
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
      const atualizada = await obterMatrizComSituacao(
        databaseUrl,
        cadastroId,
        partes[2],
      );
      if (!atualizada) {
        return Response.json({ error: "Matriz não encontrada." }, { status: 404 });
      }
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