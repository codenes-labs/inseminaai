import { bearerToken, usuarioDoToken } from "./auth/resolve-user";
import { handleDashboardRequest } from "./routes/dashboard";
import { handleRelatoriosRequest } from "./routes/relatorios";
import { handleCadastrosAuxiliaresRequest } from "./routes/cadastros-auxiliares";
import { handleInseminacoesRequest } from "./routes/inseminacoes";
import { handleImportacaoRequest } from "./routes/importacao";
import { handleMatrizesRequest } from "./routes/matrizes";
import { handlePlataformaRequest } from "./routes/plataforma";

export type DataHandlerContext = {
  databaseUrl: string;
  jwtSecret: string;
};

export async function handleDataRequest(
  request: Request,
  context: DataHandlerContext,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/") || url.pathname.startsWith("/api/auth")) {
    return null;
  }
  if (url.pathname === "/api/health") {
    return null;
  }

  const token = bearerToken(request);
  if (!token) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }
  const usuario = await usuarioDoToken(
    token,
    context.jwtSecret,
    context.databaseUrl,
  );
  if (!usuario) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

    const plataforma = await handlePlataformaRequest(request, {
      databaseUrl: context.databaseUrl,
      usuario,
    });
    if (plataforma) {
      return plataforma;
    }

    const matrizes = await handleMatrizesRequest(request, {
      databaseUrl: context.databaseUrl,
      usuario,
    });
    if (matrizes) {
      return matrizes;
    }

    const dashboard = await handleDashboardRequest(request, {
      databaseUrl: context.databaseUrl,
      usuario,
    });
    if (dashboard) {
      return dashboard;
    }

    const cadastros = await handleCadastrosAuxiliaresRequest(request, {
      databaseUrl: context.databaseUrl,
      usuario,
    });
    if (cadastros) {
      return cadastros;
    }

    const inseminacoes = await handleInseminacoesRequest(request, {
      databaseUrl: context.databaseUrl,
      usuario,
    });
    if (inseminacoes) {
      return inseminacoes;
    }

    const importacao = await handleImportacaoRequest(request, {
      databaseUrl: context.databaseUrl,
      usuario,
    });
    if (importacao) {
      return importacao;
    }

    const relatorios = await handleRelatoriosRequest(request, {
      databaseUrl: context.databaseUrl,
      usuario,
    });
    if (relatorios) {
      return relatorios;
    }

    return Response.json({ error: "Não encontrado." }, { status: 404 });
}