import { createApiHandler, type ApiHandlerOptions } from "./create-api-handler";

export function createViteDevApiHandler(options: ApiHandlerOptions) {
  return createApiHandler(options);
}