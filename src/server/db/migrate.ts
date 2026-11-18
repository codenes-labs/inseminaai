import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { semContextoRls } from "./context";

const MIGRATIONS_DIR = join(
  process.cwd(),
  ".docker/db/migrations",
);

export function listarArquivosMigration(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((nome) => /^\d+.*\.sql$/.test(nome))
    .sort();
}

export async function aplicarMigrations(databaseUrl: string): Promise<void> {
  const arquivos = listarArquivosMigration();
  await semContextoRls(databaseUrl, async (cliente) => {
    await cliente.query(`
      create table if not exists public.schema_migrations (
        nome text primary key,
        aplicado_em timestamptz not null default now()
      );
    `);

    for (const arquivo of arquivos) {
      const existente = await cliente.query<{ nome: string }>(
        `select nome from public.schema_migrations where nome = $1`,
        [arquivo],
      );
      if (existente.rowCount && existente.rowCount > 0) continue;

      const sql = readFileSync(join(MIGRATIONS_DIR, arquivo), "utf8");
      await cliente.query("begin");
      try {
        await cliente.query(sql);
        await cliente.query(
          `insert into public.schema_migrations (nome) values ($1)`,
          [arquivo],
        );
        await cliente.query("commit");
      } catch (erro) {
        await cliente.query("rollback");
        throw erro;
      }
    }
  });
}