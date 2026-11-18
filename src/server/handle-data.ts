import { bearerToken, usuarioDoToken } from "./auth/resolve-user";
import { listarMatrizes } from "./repositories/matrizes-repository";

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

  if (url.pathname === "/api/matrizes" && request.method === "GET") {
    const matrizes = await listarMatrizes(
      context.databaseUrl,
      usuario.cadastroId,
    );
    return Response.json({ matrizes });
  }

  return Response.json({ error: "Não encontrado." }, { status: 404 });
}