import { CADASTRO_ADMIN_ID, CADASTRO_DEMO_ID } from "../auth/account-seed";
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
  });
}