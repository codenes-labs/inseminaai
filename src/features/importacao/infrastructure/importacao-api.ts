import { apiFetch } from "../../../lib/api-client";

export type ResultadoImportacaoApi = {
  criadas: number;
  ignoradas: number;
  erros: string[];
};

export async function importarCsvApi(
  conteudo: string,
): Promise<ResultadoImportacaoApi> {
  const response = await apiFetch("/api/importacao/csv", {
    method: "POST",
    body: JSON.stringify({ conteudo }),
  });
  const body = (await response.json()) as
    | ResultadoImportacaoApi
    | { error?: string };
  if (!response.ok) {
    const msg =
      "error" in body && body.error
        ? body.error
        : "Não foi possível importar o arquivo.";
    throw new Error(msg);
  }
  return body as ResultadoImportacaoApi;
}