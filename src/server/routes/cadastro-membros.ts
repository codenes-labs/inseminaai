import { validarCriarMembroCadastro } from "../../features/conta/domain/criar-membro-cadastro";
import type { AuthUser } from "../auth/types";
import type { Papel } from "../auth/types";
import {
  atualizarMembroAtivo,
  criarMembroNoCadastro,
  listarMembrosDoCadastro,
} from "../repositories/membros-cadastro-repository";

function exigeAdministradorCadastro(usuario: AuthUser): Response | null {
  if (usuario.papel !== "administrador") {
    return Response.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }
  return null;
}

export async function handleCadastroMembrosRequest(
  request: Request,
  context: { databaseUrl: string; usuario: AuthUser },
): Promise<Response | null> {
  const url = new URL(request.url);
  const base = "/api/cadastro/membros";
  if (!url.pathname.startsWith(base)) {
    return null;
  }

  const negado = exigeAdministradorCadastro(context.usuario);
  if (negado) return negado;

  if (url.pathname === base && request.method === "GET") {
    const membros = await listarMembrosDoCadastro(
      context.databaseUrl,
      context.usuario.cadastroId,
    );
    return Response.json({ membros });
  }

  if (url.pathname === base && request.method === "POST") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Corpo inválido." }, { status: 400 });
    }
    const raw = body as Record<string, unknown>;
    const input = {
      nome: String(raw.nome ?? ""),
      email: String(raw.email ?? ""),
      senha: String(raw.senha ?? raw.password ?? ""),
      papel: String(raw.papel ?? "inseminador") as Papel,
    };
    const erroValidacao = validarCriarMembroCadastro(input);
    if (erroValidacao) {
      return Response.json({ error: erroValidacao }, { status: 400 });
    }
    try {
      const criado = await criarMembroNoCadastro(
        context.databaseUrl,
        context.usuario.cadastroId,
        input,
      );
      return Response.json({ ok: true, user_id: criado.userId }, { status: 201 });
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : "Não foi possível criar o usuário.";
      return Response.json({ error: mensagem }, { status: 400 });
    }
  }

  const patchMatch = url.pathname.match(/^\/api\/cadastro\/membros\/([^/]+)$/);
  if (patchMatch && request.method === "PATCH") {
    const userIdAlvo = patchMatch[1];
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Corpo inválido." }, { status: 400 });
    }
    const ativo = (body as { ativo?: boolean }).ativo;
    if (typeof ativo !== "boolean") {
      return Response.json({ error: "Informe ativo: true ou false." }, { status: 400 });
    }
    try {
      const ok = await atualizarMembroAtivo(
        context.databaseUrl,
        context.usuario.cadastroId,
        userIdAlvo,
        ativo,
        context.usuario.id,
      );
      if (!ok) {
        return Response.json({ error: "Usuário não encontrado neste cadastro." }, { status: 404 });
      }
      return Response.json({ ok: true });
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : "Não foi possível atualizar o usuário.";
      return Response.json({ error: mensagem }, { status: 400 });
    }
  }

  return Response.json({ error: "Não encontrado." }, { status: 404 });
}