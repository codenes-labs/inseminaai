import type { AuthUser } from "../auth/types";
import {
  ErroCadastroAuxiliar,
  atualizarInseminador,
  atualizarLote,
  atualizarReprodutor,
  criarInseminador,
  criarLote,
  criarReprodutor,
  listarInseminadores,
  listarLotes,
  listarReprodutores,
} from "../repositories/cadastros-auxiliares-repository";
import { bloqueiaDemo } from "./demo-guard";

type Contexto = { databaseUrl: string; usuario: AuthUser };

function respostaErro(erro: unknown): Response {
  if (erro instanceof ErroCadastroAuxiliar) {
    const status = erro.codigo === "nao_encontrada" ? 404 : 400;
    return Response.json({ error: erro.message }, { status });
  }
  throw erro;
}

function lerBodyJson(request: Request): Promise<Record<string, unknown>> {
  return request.json() as Promise<Record<string, unknown>>;
}

export async function handleCadastrosAuxiliaresRequest(
  request: Request,
  context: Contexto,
): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  const { databaseUrl, usuario } = context;
  const cadastroId = usuario.cadastroId;
  const somenteAtivos = url.searchParams.get("somente_ativos");

  if (path === "/api/reprodutores" && request.method === "GET") {
    const itens = await listarReprodutores(databaseUrl, cadastroId, somenteAtivos);
    return Response.json({ reprodutores: itens });
  }

  if (path === "/api/reprodutores" && request.method === "POST") {
    const demo = bloqueiaDemo(usuario);
    if (demo) return demo;
    try {
      const body = await lerBodyJson(request);
      const criado = await criarReprodutor(databaseUrl, cadastroId, {
        nome: String(body.nome ?? ""),
        raca: body.raca == null ? null : String(body.raca),
        codigo_semen:
          body.codigo_semen == null ? null : String(body.codigo_semen),
      });
      return Response.json({ reprodutor: criado }, { status: 201 });
    } catch (erro) {
      return respostaErro(erro);
    }
  }

  const patchReprodutor = path.match(/^\/api\/reprodutores\/([^/]+)$/);
  if (patchReprodutor && request.method === "PATCH") {
    const demo = bloqueiaDemo(usuario);
    if (demo) return demo;
    try {
      const body = await lerBodyJson(request);
      const atualizado = await atualizarReprodutor(
        databaseUrl,
        cadastroId,
        patchReprodutor[1],
        {
          nome: body.nome !== undefined ? String(body.nome) : undefined,
          raca: body.raca !== undefined ? (body.raca == null ? null : String(body.raca)) : undefined,
          codigo_semen:
            body.codigo_semen !== undefined
              ? body.codigo_semen == null
                ? null
                : String(body.codigo_semen)
              : undefined,
          ativo: typeof body.ativo === "boolean" ? body.ativo : undefined,
        },
      );
      return Response.json({ reprodutor: atualizado });
    } catch (erro) {
      return respostaErro(erro);
    }
  }

  if (path === "/api/inseminadores" && request.method === "GET") {
    const itens = await listarInseminadores(databaseUrl, cadastroId, somenteAtivos);
    return Response.json({ inseminadores: itens });
  }

  if (path === "/api/inseminadores" && request.method === "POST") {
    const demo = bloqueiaDemo(usuario);
    if (demo) return demo;
    try {
      const body = await lerBodyJson(request);
      const criado = await criarInseminador(databaseUrl, cadastroId, {
        nome: String(body.nome ?? ""),
      });
      return Response.json({ inseminador: criado }, { status: 201 });
    } catch (erro) {
      return respostaErro(erro);
    }
  }

  const patchInseminador = path.match(/^\/api\/inseminadores\/([^/]+)$/);
  if (patchInseminador && request.method === "PATCH") {
    const demo = bloqueiaDemo(usuario);
    if (demo) return demo;
    try {
      const body = await lerBodyJson(request);
      const atualizado = await atualizarInseminador(
        databaseUrl,
        cadastroId,
        patchInseminador[1],
        {
          nome: body.nome !== undefined ? String(body.nome) : undefined,
          ativo: typeof body.ativo === "boolean" ? body.ativo : undefined,
        },
      );
      return Response.json({ inseminador: atualizado });
    } catch (erro) {
      return respostaErro(erro);
    }
  }

  if (path === "/api/lotes" && request.method === "GET") {
    const itens = await listarLotes(databaseUrl, cadastroId, somenteAtivos);
    return Response.json({ lotes: itens });
  }

  if (path === "/api/lotes" && request.method === "POST") {
    const demo = bloqueiaDemo(usuario);
    if (demo) return demo;
    try {
      const body = await lerBodyJson(request);
      const criado = await criarLote(databaseUrl, cadastroId, {
        nome: String(body.nome ?? ""),
        data_inicio: String(body.data_inicio ?? ""),
        observacoes:
          body.observacoes == null ? null : String(body.observacoes),
      });
      return Response.json({ lote: criado }, { status: 201 });
    } catch (erro) {
      return respostaErro(erro);
    }
  }

  const patchLote = path.match(/^\/api\/lotes\/([^/]+)$/);
  if (patchLote && request.method === "PATCH") {
    const demo = bloqueiaDemo(usuario);
    if (demo) return demo;
    try {
      const body = await lerBodyJson(request);
      const atualizado = await atualizarLote(
        databaseUrl,
        cadastroId,
        patchLote[1],
        {
          nome: body.nome !== undefined ? String(body.nome) : undefined,
          data_inicio:
            body.data_inicio !== undefined
              ? String(body.data_inicio)
              : undefined,
          observacoes:
            body.observacoes !== undefined
              ? body.observacoes == null
                ? null
                : String(body.observacoes)
              : undefined,
          ativo: typeof body.ativo === "boolean" ? body.ativo : undefined,
        },
      );
      return Response.json({ lote: atualizado });
    } catch (erro) {
      return respostaErro(erro);
    }
  }

  return null;
}