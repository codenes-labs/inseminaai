import { validarProvisionarCadastroAutonomo } from "../../features/plataforma/domain/provisionar-cadastro-autonomo";
import type { AuthUser } from "../auth/types";
import {
  criarCadastroAutonomoNoBanco,
  listarCadastrosPlataforma,
} from "../repositories/plataforma-cadastros-repository";

export async function handlePlataformaRequest(
  request: Request,
  context: { databaseUrl: string; usuario: AuthUser },
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/plataforma/")) {
    return null;
  }

  if (!context.usuario.plataformaAdmin) {
    return Response.json({ error: "Acesso restrito à plataforma." }, { status: 403 });
  }

  if (url.pathname === "/api/plataforma/cadastros" && request.method === "GET") {
    const lista = await listarCadastrosPlataforma(context.databaseUrl);
    return Response.json({ cadastros: lista });
  }

  if (url.pathname === "/api/plataforma/cadastros" && request.method === "POST") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Corpo inválido." }, { status: 400 });
    }
    const raw = body as Record<string, unknown>;
    const input = {
      nomeCadastro: String(raw.nome_cadastro ?? raw.nomeCadastro ?? ""),
      nomeUsuario: String(raw.nome_usuario ?? raw.nomeUsuario ?? ""),
      email: String(raw.email ?? ""),
      senha: String(raw.senha ?? raw.password ?? ""),
    };
    const erroValidacao = validarProvisionarCadastroAutonomo(input);
    if (erroValidacao) {
      return Response.json({ error: erroValidacao }, { status: 400 });
    }
    try {
      const criado = await criarCadastroAutonomoNoBanco(context.databaseUrl, input);
      return Response.json({ ok: true, ...criado }, { status: 201 });
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : "Não foi possível criar o cadastro.";
      return Response.json({ error: mensagem }, { status: 400 });
    }
  }

  return Response.json({ error: "Não encontrado." }, { status: 404 });
}