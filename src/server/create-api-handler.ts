import { handleAuthRequest } from "./auth/handle-auth";
import { handleDataRequest } from "./handle-data";
import { pingBanco } from "./db/pool";

export type ApiHandlerOptions = {
  databaseUrl?: string;
  jwtSecret?: string;
  turnstileSecretKey?: string;
};

export function createApiHandler(
  options: ApiHandlerOptions,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const databaseUrl = options.databaseUrl?.trim();
    const jwtSecret = options.jwtSecret?.trim() ?? "";
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      let databaseOk = false;
      if (databaseUrl) {
        try {
          databaseOk = await pingBanco(databaseUrl);
        } catch {
          databaseOk = false;
        }
      }
      return Response.json({
        configured: Boolean(databaseUrl && jwtSecret.length >= 32),
        database: Boolean(databaseUrl),
        database_ok: databaseOk,
        jwt: Boolean(jwtSecret.length >= 32),
      });
    }

    if (jwtSecret.length >= 32) {
      const auth = await handleAuthRequest(request, {
        jwtSecret,
        databaseUrl,
        turnstileSecretKey: options.turnstileSecretKey,
      });
      if (auth) {
        return auth;
      }
    } else if (url.pathname.startsWith("/api/auth")) {
      return Response.json(
        { error: "Autenticação não configurada." },
        { status: 503 },
      );
    }

    if (databaseUrl && jwtSecret.length >= 32) {
      const data = await handleDataRequest(request, {
        databaseUrl,
        jwtSecret,
      });
      if (data) {
        return data;
      }
    }

    return Response.json({ error: "Não encontrado." }, { status: 404 });
  };
}