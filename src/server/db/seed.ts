import { CADASTRO_ADMIN_ID, CADASTRO_DEMO_ID } from "../auth/account-seed";
import {
  DEMO_INSEMINADORES,
  DEMO_LOTES,
  DEMO_MATRIZES,
  DEMO_REPRODUTORES,
} from "./demo-fixtures";
import { semContextoRls } from "./context";
import { hashSenha } from "./password";

const USER_ADMIN_ID = "00000000-0000-4000-9000-000000000001";
const USER_DEMO_ID = "00000000-0000-4000-9000-000000000002";

export async function aplicarSeedDev(databaseUrl: string): Promise<void> {
  await semContextoRls(databaseUrl, async (cliente) => {
    await cliente.query(
      `insert into public.cadastros (id, nome, plano, ativa)
       values
         ($1, 'Cadastro administrador', 'pro', true),
         ($2, 'Cadastro demo', 'gratuito', true)
       on conflict (id) do nothing`,
      [CADASTRO_ADMIN_ID, CADASTRO_DEMO_ID],
    );

    await cliente.query(
      `insert into public.users (id, email, password_hash, nome, demo)
       values
         ($1, 'admin@codenes.com.br', $3, 'Administrador', false),
         ($2, 'teste@teste.com', $4, 'Conta demo', true)
       on conflict (email) do update
         set password_hash = excluded.password_hash,
             nome = excluded.nome,
             demo = excluded.demo`,
      [
        USER_ADMIN_ID,
        USER_DEMO_ID,
        hashSenha("CodenesTemp1"),
        hashSenha("teste"),
      ],
    );

    await cliente.query(
      `insert into public.membros_cadastro (cadastro_id, user_id, papel)
       values
         ($1, $3, 'administrador'),
         ($2, $4, 'inseminador')
       on conflict (user_id) do update
         set cadastro_id = excluded.cadastro_id,
             papel = excluded.papel`,
      [CADASTRO_ADMIN_ID, CADASTRO_DEMO_ID, USER_ADMIN_ID, USER_DEMO_ID],
    );

    for (const reprodutor of DEMO_REPRODUTORES) {
      await cliente.query(
        `insert into public.reprodutores
           (id, cadastro_id, nome, raca, codigo_semen, ativo)
         values ($1, $2, $3, $4, $5, true)
         on conflict (id) do update
           set nome = excluded.nome,
               raca = excluded.raca,
               codigo_semen = excluded.codigo_semen,
               ativo = true`,
        [
          reprodutor.id,
          CADASTRO_DEMO_ID,
          reprodutor.nome,
          reprodutor.raca,
          reprodutor.codigo_semen,
        ],
      );
    }

    for (const inseminador of DEMO_INSEMINADORES) {
      await cliente.query(
        `insert into public.inseminadores (id, cadastro_id, nome, ativo)
         values ($1, $2, $3, true)
         on conflict (id) do update
           set nome = excluded.nome,
               ativo = true`,
        [inseminador.id, CADASTRO_DEMO_ID, inseminador.nome],
      );
    }

    for (const lote of DEMO_LOTES) {
      await cliente.query(
        `insert into public.lotes
           (id, cadastro_id, nome, data_inicio, observacoes, ativo)
         values ($1, $2, $3, $4::date, $5, true)
         on conflict (id) do update
           set nome = excluded.nome,
               data_inicio = excluded.data_inicio,
               observacoes = excluded.observacoes,
               ativo = true`,
        [
          lote.id,
          CADASTRO_DEMO_ID,
          lote.nome,
          lote.data_inicio,
          lote.observacoes,
        ],
      );
    }

    for (const matriz of DEMO_MATRIZES) {
      await cliente.query(
        `insert into public.matrizes
           (id, cadastro_id, nome, brinco, raca, observacoes, ativa)
         values ($1, $2, $3, $4, $5, $6, true)
         on conflict (id) do update
           set nome = excluded.nome,
               brinco = excluded.brinco,
               raca = excluded.raca,
               observacoes = excluded.observacoes,
               ativa = true`,
        [
          matriz.id,
          CADASTRO_DEMO_ID,
          matriz.nome,
          matriz.brinco,
          matriz.raca,
          matriz.observacoes,
        ],
      );
    }

    const idsMatrizes = DEMO_MATRIZES.map((m) => m.id);
    const idsReprodutores = DEMO_REPRODUTORES.map((r) => r.id);
    const idsInseminadores = DEMO_INSEMINADORES.map((i) => i.id);
    const idsLotes = DEMO_LOTES.map((l) => l.id);

    await limparCadastroDemoForaFixtures(cliente, {
      idsMatrizes,
      idsReprodutores,
      idsInseminadores,
      idsLotes,
    });
  });
}

type IdsDemoFixtures = {
  idsMatrizes: string[];
  idsReprodutores: string[];
  idsInseminadores: string[];
  idsLotes: string[];
};

/** Remove lixo (ex.: linhas criadas por testes de RLS) e mantém só o catálogo demo. */
async function limparCadastroDemoForaFixtures(
  cliente: { query: (sql: string, params?: unknown[]) => Promise<unknown> },
  ids: IdsDemoFixtures,
): Promise<void> {
  await cliente.query(
    `delete from public.inseminacoes
     where cadastro_id = $1
       and matriz_id <> all($2::uuid[])`,
    [CADASTRO_DEMO_ID, ids.idsMatrizes],
  );

  await cliente.query(
    `delete from public.matrizes
     where cadastro_id = $1
       and id <> all($2::uuid[])`,
    [CADASTRO_DEMO_ID, ids.idsMatrizes],
  );

  await cliente.query(
    `delete from public.reprodutores
     where cadastro_id = $1
       and id <> all($2::uuid[])`,
    [CADASTRO_DEMO_ID, ids.idsReprodutores],
  );

  await cliente.query(
    `delete from public.inseminadores
     where cadastro_id = $1
       and id <> all($2::uuid[])`,
    [CADASTRO_DEMO_ID, ids.idsInseminadores],
  );

  await cliente.query(
    `delete from public.lotes
     where cadastro_id = $1
       and id <> all($2::uuid[])`,
    [CADASTRO_DEMO_ID, ids.idsLotes],
  );
}