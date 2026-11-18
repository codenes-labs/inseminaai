import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(databaseUrl: string): pg.Pool {
  const url = databaseUrl.trim();
  if (!pool) {
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

export async function fecharPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function pingBanco(databaseUrl: string): Promise<boolean> {
  const cliente = await getPool(databaseUrl).connect();
  try {
    await cliente.query("select 1");
    return true;
  } finally {
    cliente.release();
  }
}