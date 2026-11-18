import { comCadastroId } from "../db/context";

export type MatrizResumo = {
  id: string;
  nome: string;
  brinco: string | null;
  ativa: boolean;
};

export async function listarMatrizes(
  databaseUrl: string,
  cadastroId: string,
): Promise<MatrizResumo[]> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<MatrizResumo>(
      `select id, nome, brinco, ativa
       from public.matrizes
       order by nome asc`,
    );
    return resultado.rows;
  });
}