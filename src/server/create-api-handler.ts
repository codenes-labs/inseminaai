import { handleAuthRequest } from "./auth/handle-auth";

export type ApiHandlerOptions = {
  databaseUrl?: string;
  jwtSecret?: string;
};

export function createApiHandler(
  options: ApiHandlerOptions,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const databaseUrl = options.databaseUrl?.trim();
    const jwtSecret = options.jwtSecret?.trim() ?? "";
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return Response.json({
        configured: Boolean(databaseUrl && jwtSecret),
        database: Boolean(databaseUrl),
        jwt: Boolean(jwtSecret.length >= 32),
      });
    }

    if (jwtSecret.length >= 32) {
      const auth = await handleAuthRequest(request, { jwtSecret });
      if (auth) {
        return auth;
      }
    } else if (url.pathname.startsWith("/api/auth")) {
      return Response.json(
        { error: "Autenticação não configurada." },
        { status: 503 },
      );
    }

    return Response.json({ error: "Não encontrado." }, { status: 404 });
  };
}