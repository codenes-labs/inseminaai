-- Schema Insemina aí (SPEC-14): users do servidor + RLS por app.cadastro_id

create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  nome text not null,
  demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.cadastros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  plano text not null default 'gratuito',
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.membros_cadastro (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.cadastros (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  papel text not null check (papel in ('administrador', 'inseminador')),
  unique (user_id)
);

create table public.matrizes (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.cadastros (id) on delete cascade,
  nome text not null,
  brinco text,
  raca text,
  data_nascimento date,
  ativa boolean not null default true,
  observacoes text,
  created_at timestamptz not null default now(),
  unique (cadastro_id, brinco)
);

create table public.reprodutores (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.cadastros (id) on delete cascade,
  nome text not null,
  raca text,
  codigo_semen text,
  ativo boolean not null default true
);

create table public.inseminadores (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.cadastros (id) on delete cascade,
  nome text not null,
  ativo boolean not null default true
);

create table public.lotes (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.cadastros (id) on delete cascade,
  nome text not null,
  data_inicio date not null,
  observacoes text
);

create table public.inseminacoes (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.cadastros (id) on delete cascade,
  matriz_id uuid not null references public.matrizes (id) on delete restrict,
  reprodutor_id uuid not null references public.reprodutores (id) on delete restrict,
  inseminador_id uuid not null references public.inseminadores (id) on delete restrict,
  lote_id uuid references public.lotes (id) on delete set null,
  data date not null,
  tipo text not null check (tipo in ('CN', 'IATF', 'PROTOCOLO')),
  numero_tentativa int not null check (numero_tentativa >= 1),
  status text not null check (status in ('pendente', 'prenhe', 'vazia')),
  data_diagnostico_prevista date,
  data_diagnostico date,
  previsao_parto date,
  data_parto date,
  observacoes text,
  created_at timestamptz not null default now()
);

create index idx_users_email on public.users (email);
create index idx_membros_cadastro_user on public.membros_cadastro (user_id);
create index idx_membros_cadastro_cadastro on public.membros_cadastro (cadastro_id);
create index idx_matrizes_cadastro on public.matrizes (cadastro_id);
create index idx_reprodutores_cadastro on public.reprodutores (cadastro_id);
create index idx_inseminadores_cadastro on public.inseminadores (cadastro_id);
create index idx_lotes_cadastro on public.lotes (cadastro_id);
create index idx_inseminacoes_cadastro on public.inseminacoes (cadastro_id);
create index idx_inseminacoes_matriz on public.inseminacoes (matriz_id);

create or replace function public.current_cadastro_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.cadastro_id', true), '')::uuid;
$$;

alter table public.cadastros enable row level security;
alter table public.membros_cadastro enable row level security;
alter table public.matrizes enable row level security;
alter table public.reprodutores enable row level security;
alter table public.inseminadores enable row level security;
alter table public.lotes enable row level security;
alter table public.inseminacoes enable row level security;

alter table public.cadastros force row level security;
alter table public.membros_cadastro force row level security;
alter table public.matrizes force row level security;
alter table public.reprodutores force row level security;
alter table public.inseminadores force row level security;
alter table public.lotes force row level security;
alter table public.inseminacoes force row level security;

create policy cadastros_select on public.cadastros
  for select
  using (id = public.current_cadastro_id());

create policy membros_select on public.membros_cadastro
  for select
  using (cadastro_id = public.current_cadastro_id());

create policy matrizes_all on public.matrizes
  for all
  using (cadastro_id = public.current_cadastro_id())
  with check (cadastro_id = public.current_cadastro_id());

create policy reprodutores_all on public.reprodutores
  for all
  using (cadastro_id = public.current_cadastro_id())
  with check (cadastro_id = public.current_cadastro_id());

create policy inseminadores_all on public.inseminadores
  for all
  using (cadastro_id = public.current_cadastro_id())
  with check (cadastro_id = public.current_cadastro_id());

create policy lotes_all on public.lotes
  for all
  using (cadastro_id = public.current_cadastro_id())
  with check (cadastro_id = public.current_cadastro_id());

create policy inseminacoes_all on public.inseminacoes
  for all
  using (cadastro_id = public.current_cadastro_id())
  with check (cadastro_id = public.current_cadastro_id());

-- Role de app sem BYPASSRLS (o usuário do compose é superuser em dev).
do $$
begin
  if not exists (select 1 from pg_catalog.pg_roles where rolname = 'inseminaai_app') then
    create role inseminaai_app with login password 'inseminaai_app' nosuperuser nobypassrls;
  end if;
end
$$;

grant usage on schema public to inseminaai_app;
grant select, insert, update, delete on public.cadastros to inseminaai_app;
grant select, insert, update, delete on public.membros_cadastro to inseminaai_app;
grant select, insert, update, delete on public.matrizes to inseminaai_app;
grant select, insert, update, delete on public.reprodutores to inseminaai_app;
grant select, insert, update, delete on public.inseminadores to inseminaai_app;
grant select, insert, update, delete on public.lotes to inseminaai_app;
grant select, insert, update, delete on public.inseminacoes to inseminaai_app;
grant select on public.users to inseminaai_app;
grant execute on function public.current_cadastro_id() to inseminaai_app;
grant inseminaai_app to inseminaai;