import { createApiHandler } from "../src/server/create-api-handler";

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY?: string;
  ASSETS: { fetch: typeof fetch };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const handler = createApiHandler({
        databaseUrl: env.DATABASE_URL,
        jwtSecret: env.JWT_SECRET,
        turnstileSecretKey: env.TURNSTILE_SECRET_KEY,
      });
      return handler(request);
    }
    return env.ASSETS.fetch(request);
  },
};