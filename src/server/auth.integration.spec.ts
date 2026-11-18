import { createServer } from "node:http";
import { describe, expect, it } from "vitest";
import { createApiHandler } from "./create-api-handler";
import { MENSAGEM_CREDENCIAIS_INVALIDAS } from "./auth/types";

const JWT_SECRET = "dev-inseminaai-jwt-secret-32chars-minimum";

async function withHttpServer(
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const handler = createApiHandler({ jwtSecret: JWT_SECRET });
  const server = createServer((incoming, outgoing) => {
    void (async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks);
      const headers = new Headers();
      for (const [key, value] of Object.entries(incoming.headers)) {
        if (typeof value === "string") {
          headers.set(key, value);
        } else if (Array.isArray(value)) {
          headers.set(key, value.join(", "));
        }
      }
      const host = incoming.headers.host ?? "127.0.0.1";
      const request = new Request(`http://${host}${incoming.url ?? "/"}`, {
        method: incoming.method,
        headers,
        body:
          incoming.method === "GET" || incoming.method === "HEAD"
            ? undefined
            : body,
      });
      const response = await handler(request);
      outgoing.statusCode = response.status;
      response.headers.forEach((value, key) => outgoing.setHeader(key, value));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    })();
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Servidor de teste não obteve porta.");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("POST /api/auth/sign-in", () => {
  it("credenciais inválidas retornam mensagem genérica", async () => {
    await withHttpServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/sign-in`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "nao@existe.com",
          password: "errada",
        }),
      });
      expect(response.status).toBe(401);
      const body = (await response.json()) as { error: string };
      expect(body.error).toBe(MENSAGEM_CREDENCIAIS_INVALIDAS);
      expect(body.error).not.toMatch(/e-mail|senha/i);
    });
  });

  it("seed admin retorna token e cadastro_id", async () => {
    await withHttpServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/sign-in`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "admin@codenes.com.br",
          password: "CodenesTemp1",
        }),
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        token: string;
        user: { cadastro_id: string; papel: string; demo: boolean };
      };
      expect(body.token.length).toBeGreaterThan(20);
      expect(body.user.cadastro_id).toBe(
        "00000000-0000-4000-8000-000000000001",
      );
      expect(body.user.papel).toBe("administrador");
      expect(body.user.demo).toBe(false);
    });
  });

  it("seed demo retorna conta demo", async () => {
    await withHttpServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/sign-in`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "teste@teste.com",
          password: "teste",
        }),
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        user: { demo: boolean; papel: string; cadastro_id: string };
      };
      expect(body.user.demo).toBe(true);
      expect(body.user.papel).toBe("inseminador");
      expect(body.user.cadastro_id).toBe(
        "00000000-0000-4000-8000-000000000002",
      );
    });
  });
});

describe("GET /api/auth/session", () => {
  it("valida token emitido no sign-in", async () => {
    await withHttpServer(async (baseUrl) => {
      const signIn = await fetch(`${baseUrl}/api/auth/sign-in`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "teste@teste.com",
          password: "teste",
        }),
      });
      const { token } = (await signIn.json()) as { token: string };
      const session = await fetch(`${baseUrl}/api/auth/session`, {
        headers: { authorization: `Bearer ${token}` },
      });
      expect(session.status).toBe(200);
      const body = (await session.json()) as {
        user: { email: string; cadastro_id: string };
        expires_at: number;
      };
      expect(body.user.email).toBe("teste@teste.com");
      expect(body.user.cadastro_id).toBeTruthy();
      expect(body.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });
});