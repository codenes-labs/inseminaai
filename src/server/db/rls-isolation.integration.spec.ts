import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CADASTRO_ADMIN_ID, CADASTRO_DEMO_ID } from "../auth/account-seed";
import { comCadastroId, comRoleAppSemCadastro, semContextoRls } from "./context";
import { fecharPool } from "./pool";
import { aplicarMigrations } from "./migrate";
import { aplicarSeedDev } from "./seed";

const databaseUrl = process.env.DATABASE_URL?.trim();

const describeComBanco = databaseUrl ? describe : describe.skip;

describeComBanco("RLS por cadastro_id", () => {
  const matrizesTeste: string[] = [];

  beforeAll(async () => {
    await aplicarMigrations(databaseUrl!);
    await aplicarSeedDev(databaseUrl!);
  });

  afterAll(async () => {
    if (databaseUrl && matrizesTeste.length > 0) {
      await semContextoRls(databaseUrl, async (cliente) => {
        await cliente.query(
          `delete from public.matrizes where id = any($1::uuid[])`,
          [matrizesTeste],
        );
      });
    }
    await fecharPool();
  });

  it("cadastro A não lê matriz do cadastro B", async () => {
    const idMatrizB = randomUUID();
    matrizesTeste.push(idMatrizB);
    await comCadastroId(databaseUrl!, CADASTRO_DEMO_ID, async (cliente) => {
      await cliente.query(
        `insert into public.matrizes (id, cadastro_id, nome, ativa)
         values ($1, $2, 'Matriz B (teste RLS)', true)`,
        [idMatrizB, CADASTRO_DEMO_ID],
      );
    });

    const linhasA = await comCadastroId(
      databaseUrl!,
      CADASTRO_ADMIN_ID,
      async (cliente) => {
        const resultado = await cliente.query<{ id: string }>(
          `select id from public.matrizes where id = $1`,
          [idMatrizB],
        );
        return resultado.rows;
      },
    );
    expect(linhasA).toHaveLength(0);
  });

  it("cadastro A vê apenas dados do próprio cadastro", async () => {
    const idMatrizA = randomUUID();
    matrizesTeste.push(idMatrizA);
    await comCadastroId(databaseUrl!, CADASTRO_ADMIN_ID, async (cliente) => {
      await cliente.query(
        `insert into public.matrizes (id, cadastro_id, nome, ativa)
         values ($1, $2, 'Matriz A (teste RLS)', true)`,
        [idMatrizA, CADASTRO_ADMIN_ID],
      );
    });

    const linhas = await comCadastroId(
      databaseUrl!,
      CADASTRO_ADMIN_ID,
      async (cliente) => {
        const resultado = await cliente.query<{ id: string }>(
          `select id from public.matrizes where id = $1`,
          [idMatrizA],
        );
        return resultado.rows;
      },
    );
    expect(linhas).toHaveLength(1);
  });

  it("sem contexto app.cadastro_id não retorna linhas", async () => {
    await comRoleAppSemCadastro(databaseUrl!, async (cliente) => {
      const resultado = await cliente.query(`select id from public.matrizes`);
      expect(resultado.rows).toHaveLength(0);
    });
  });
});