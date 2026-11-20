import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { ViteDevServer } from "vite";
import { defineConfig } from "vite";
type DevApiHandler = (request: Request) => Promise<Response>;

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
  build: {
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: resolveDevPort(),
    strictPort: true,
  },
});

function devApi() {
  return {
    name: "inseminaai-dev-api",
    configureServer(server: ViteDevServer) {
      process.on("unhandledRejection", (reason) => {
        console.error("[vite dev api] unhandledRejection", reason);
      });
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith("/api")) {
          next();
          return;
        }
        void (async () => {
          try {
            const handler = await resolveDevApiHandler(server);
            const webResponse = await handler(await toWebRequest(request));
            await writeWebResponse(response, webResponse);
          } catch (cause) {
            if (!response.headersSent) {
              response.statusCode = 500;
              response.end(
                cause instanceof Error ? cause.message : "Falha na API.",
              );
            }
          }
        })();
      });
    },
  };
}

async function resolveDevApiHandler(
  server: ViteDevServer,
): Promise<DevApiHandler> {
  const mod = (await server.ssrLoadModule("/src/server/vite-api-handler.ts")) as {
    createViteDevApiHandler: (options: {
      databaseUrl?: string;
      jwtSecret?: string;
    }) => DevApiHandler;
  };
  return mod.createViteDevApiHandler({
    databaseUrl: loadEnvValue("DATABASE_URL"),
    jwtSecret: loadEnvValue("JWT_SECRET"),
  });
}

function resolveDevPort(): number {
  const fromProcess = process.env.PORT_INTERNAL?.trim();
  if (fromProcess && /^\d+$/.test(fromProcess)) {
    return Number(fromProcess);
  }
  const fromFile = loadEnvValue("PORT_INTERNAL");
  if (fromFile && /^\d+$/.test(fromFile)) {
    return Number(fromFile);
  }
  return 5173;
}

function loadEnvValue(name: string): string | undefined {
  const fromProcess = process.env[name]?.trim();
  if (fromProcess) {
    return fromProcess;
  }
  const root = dirname(fileURLToPath(import.meta.url));
  try {
    const text = readFileSync(join(root, ".docker/.env"), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      if (trimmed.startsWith(`${name}=`)) {
        return trimmed.slice(name.length + 1).trim();
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

async function toWebRequest(request: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks);
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    }
  }
  return new Request(
    `http://${request.headers.host ?? "localhost"}${request.url ?? "/"}`,
    {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD" ? undefined : body,
    },
  );
}

async function writeWebResponse(
  response: ServerResponse,
  webResponse: Response,
): Promise<void> {
  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });
  response.end(Buffer.from(await webResponse.arrayBuffer()));
}