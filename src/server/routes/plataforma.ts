import { validarCriarMembroCadastro } from "../../features/conta/domain/criar-membro-cadastro";
import { cadastroPermiteMultiplosAcessos } from "../../features/plataforma/domain/tipo-cadastro-plataforma";
import { validarProvisionarCadastroAutonomo } from "../../features/plataforma/domain/provisionar-cadastro-autonomo";
import type { AuthUser } from "../auth/types";
import type { Papel } from "../auth/types";
import {
  atualizarMembroNoCadastro,
  criarMembroNoCadastro,
  excluirMembroDoCadastro,
  listarMembrosDoCadastro,
} from "../repositories/membros-cadastro-repository";
import {
  atualizarCadastroPlataforma,
  criarCadastroAutonomoNoBanco,
  excluirCadastroPlataforma,
  listarCadastrosPlataforma,
  obterCadastroPlataforma,
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
    const tipoRaw = String(raw.tipo ?? "autonomo");
    const tipo = tipoRaw === "empresa" ? "empresa" : "autonomo";
    const input = {
      nomeCadastro: String(raw.nome_cadastro ?? raw.nomeCadastro ?? ""),
      nomeUsuario: String(raw.nome_usuario ?? raw.nomeUsuario ?? ""),
      email: String(raw.email ?? ""),
      senha: String(raw.senha ?? raw.password ?? ""),
      tipo,
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

  const cadastroMatch = url.pathname.match(
    /^\/api\/plataforma\/cadastros\/([^/]+)(.*)$/,
  );
  if (cadastroMatch) {
    const cadastroId = cadastroMatch[1];
    const sufixo = cadastroMatch[2] ?? "";

    if (sufixo === "" && request.method === "GET") {
      const cadastro = await obterCadastroPlataforma(context.databaseUrl, cadastroId);
      if (!cadastro) {
        return Response.json({ error: "Cadastro não encontrado." }, { status: 404 });
      }
      return Response.json({ cadastro });
    }

    if (sufixo === "" && request.method === "DELETE") {
      try {
        await excluirCadastroPlataforma(context.databaseUrl, cadastroId);
        return Response.json({ ok: true });
      } catch (erro) {
        const mensagem =
          erro instanceof Error ? erro.message : "Não foi possível excluir o cadastro.";
        const status = mensagem.includes("sistema") ? 403 : 400;
        return Response.json({ error: mensagem }, { status });
      }
    }

    if (sufixo === "" && request.method === "PATCH") {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: "Corpo inválido." }, { status: 400 });
      }
      const raw = body as Record<string, unknown>;
      const tipoRaw = String(raw.tipo ?? "autonomo");
      const tipo = tipoRaw === "empresa" ? "empresa" : "autonomo";
      const ativa = raw.ativa !== false;
      try {
        const ok = await atualizarCadastroPlataforma(context.databaseUrl, cadastroId, {
          nome: String(raw.nome ?? ""),
          tipo,
          ativa,
        });
        if (!ok) {
          return Response.json({ error: "Cadastro não encontrado." }, { status: 404 });
        }
        return Response.json({ ok: true });
      } catch (erro) {
        const mensagem =
          erro instanceof Error ? erro.message : "Não foi possível salvar o cadastro.";
        return Response.json({ error: mensagem }, { status: 400 });
      }
    }

    if (sufixo === "/membros" && request.method === "GET") {
      const membros = await listarMembrosDoCadastro(context.databaseUrl, cadastroId, {
        plataforma: true,
      });
      return Response.json({ membros });
    }

    if (sufixo === "/membros" && request.method === "POST") {
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
      const existe = await obterCadastroPlataforma(context.databaseUrl, cadastroId);
      if (!existe) {
        return Response.json({ error: "Cadastro não encontrado." }, { status: 404 });
      }
      if (!cadastroPermiteMultiplosAcessos(existe.tipo)) {
        return Response.json(
          {
            error:
              "Cadastro autônomo tem um único login; edite o acesso existente.",
          },
          { status: 400 },
        );
      }
      try {
        const criado = await criarMembroNoCadastro(
          context.databaseUrl,
          cadastroId,
          input,
          { plataforma: true },
        );
        return Response.json({ ok: true, user_id: criado.userId }, { status: 201 });
      } catch (erro) {
        const mensagem =
          erro instanceof Error ? erro.message : "Não foi possível criar o acesso.";
        return Response.json({ error: mensagem }, { status: 400 });
      }
    }

    const membroMatch = sufixo.match(/^\/membros\/([^/]+)$/);
    if (membroMatch) {
      const userIdAlvo = membroMatch[1];
      if (request.method === "DELETE") {
        try {
          const ok = await excluirMembroDoCadastro(
            context.databaseUrl,
            cadastroId,
            userIdAlvo,
            { plataforma: true },
          );
          if (!ok) {
            return Response.json({ error: "Acesso não encontrado." }, { status: 404 });
          }
          return Response.json({ ok: true });
        } catch (erro) {
          const mensagem =
            erro instanceof Error ? erro.message : "Não foi possível excluir o acesso.";
          const status = mensagem.includes("sistema") ? 403 : 400;
          return Response.json({ error: mensagem }, { status });
        }
      }
      if (request.method === "PATCH") {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Corpo inválido." }, { status: 400 });
        }
        const raw = body as Record<string, unknown>;
        try {
          const ok = await atualizarMembroNoCadastro(
            context.databaseUrl,
            cadastroId,
            userIdAlvo,
            {
              nome: raw.nome !== undefined ? String(raw.nome) : undefined,
              email: raw.email !== undefined ? String(raw.email) : undefined,
              papel:
                raw.papel !== undefined
                  ? (String(raw.papel) as Papel)
                  : undefined,
              ativo:
                typeof raw.ativo === "boolean" ? raw.ativo : undefined,
              senha: raw.senha !== undefined ? String(raw.senha) : undefined,
            },
            { plataforma: true },
          );
          if (!ok) {
            return Response.json({ error: "Acesso não encontrado." }, { status: 404 });
          }
          return Response.json({ ok: true });
        } catch (erro) {
          const mensagem =
            erro instanceof Error ? erro.message : "Não foi possível atualizar o acesso.";
          return Response.json({ error: mensagem }, { status: 400 });
        }
      }
    }
  }

  return Response.json({ error: "Não encontrado." }, { status: 404 });
}