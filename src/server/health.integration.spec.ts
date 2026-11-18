import { createServer } from "node:http";
import { describe, expect, it } from "vitest";
import { createApiHandler } from "./create-api-handler";

async function withHttpServer(
  options: Parameters<typeof createApiHandler>[0],
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const handler = createApiHandler(options);
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

describe("GET /api/health", () => {
  it("sem secrets retorna configured false", async () => {
    await withHttpServer({}, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/health`);
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        configured: boolean;
        database: boolean;
        jwt: boolean;
      };
      expect(body).toEqual({
        configured: false,
        database: false,
        jwt: false,
      });
    });
  });

  it("com DATABASE_URL e JWT_SECRET fictícios retorna configured true", async () => {
    await withHttpServer(
      {
        databaseUrl: "postgresql://inseminaai:inseminaai@localhost:5434/inseminaai",
        jwtSecret: "x".repeat(32),
      },
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/health`);
        expect(response.status).toBe(200);
        const body = (await response.json()) as {
          configured: boolean;
          database: boolean;
          jwt: boolean;
        };
        expect(body).toEqual({
          configured: true,
          database: true,
          jwt: true,
        });
      },
    );
  });
});