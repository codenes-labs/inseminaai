import { createServer } from "node:http";
import { describe, expect, it } from "vitest";
import { createApiHandler } from "./create-api-handler";
import {
  calcularDataDiagnosticoPrevista,
  calcularProximaTentativa,
} from "../features/inseminacoes/domain/calculos";

const JWT_SECRET = "dev-inseminaai-jwt-secret-32chars-minimum";
const databaseUrl = process.env.DATABASE_URL?.trim();

const describeComBanco = databaseUrl ? describe : describe.skip;

describe("domínio inseminação (SPEC-04)", () => {
  it("calcula tentativa e diagnóstico previsto", () => {
    expect(calcularProximaTentativa([])).toBe(1);
    expect(calcularDataDiagnosticoPrevista("2026-01-15")).toBe("2026-02-14");
  });
});

async function withHttpServer(
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const handler = createApiHandler({
    jwtSecret: JWT_SECRET,
    databaseUrl,
  });
  const server = createServer((incoming, outgoing) => {
    void (async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks);
      const headers = new Headers();
      for (const [key, value] of Object.entries(incoming.headers)) {
        if (typeof value === "string") headers.set(key, value);
        else if (Array.isArray(value)) headers.set(key, value.join(", "));
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
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Sem porta.");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

describeComBanco("POST /api/inseminacoes", () => {
  it("exige autenticação", async () => {
    await withHttpServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/inseminacoes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(401);
    });
  });
});