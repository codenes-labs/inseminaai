import { bearerToken, usuarioDoToken } from "./auth/resolve-user";
import { handleCadastrosAuxiliaresRequest } from "./routes/cadastros-auxiliares";
import { handleMatrizesRequest } from "./routes/matrizes";

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

    const matrizes = await handleMatrizesRequest(request, {
      databaseUrl: context.databaseUrl,
      usuario,
    });
    if (matrizes) {
      return matrizes;
    }

    const cadastros = await handleCadastrosAuxiliaresRequest(request, {
      databaseUrl: context.databaseUrl,
      usuario,
    });
    if (cadastros) {
      return cadastros;
    }

    return Response.json({ error: "Não encontrado." }, { status: 404 });
}