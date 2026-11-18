import type pg from "pg";
import { APP_CADASTRO_SETTING } from "../schema";
import { getPool } from "./pool";

export type DbCliente = pg.PoolClient;

export const APP_DB_ROLE = "inseminaai_app";

async function ativarRoleApp(cliente: DbCliente) {
  await cliente.query(`set local role ${APP_DB_ROLE}`);
}

export async function comCadastroId<T>(
  databaseUrl: string,
  cadastroId: string,
  executar: (cliente: DbCliente) => Promise<T>,
): Promise<T> {
  const cliente = await getPool(databaseUrl).connect();
  try {
    await cliente.query("begin");
    await ativarRoleApp(cliente);
    await cliente.query(
      `select set_config($1, $2, true)`,
      [APP_CADASTRO_SETTING, cadastroId],
    );
    const resultado = await executar(cliente);
    await cliente.query("commit");
    return resultado;
  } catch (erro) {
    await cliente.query("rollback");
    throw erro;
  } finally {
    cliente.release();
  }
}

/** Consultas de login sem contexto RLS (tabela users sem RLS). */
/** Uso admin (migrations, seed, login em users). */
export async function semContextoRls<T>(
  databaseUrl: string,
  executar: (cliente: DbCliente) => Promise<T>,
): Promise<T> {
  const cliente = await getPool(databaseUrl).connect();
  try {
    return await executar(cliente);
  } finally {
    cliente.release();
  }
}

/** Leituras de domínio sem cadastro_id (espera zero linhas com RLS). */
export async function comRoleAppSemCadastro<T>(
  databaseUrl: string,
  executar: (cliente: DbCliente) => Promise<T>,
): Promise<T> {
  const cliente = await getPool(databaseUrl).connect();
  try {
    await cliente.query("begin");
    await ativarRoleApp(cliente);
    const resultado = await executar(cliente);
    await cliente.query("commit");
    return resultado;
  } catch (erro) {
    await cliente.query("rollback");
    throw erro;
  } finally {
    cliente.release();
  }
}