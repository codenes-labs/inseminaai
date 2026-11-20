-- SPEC-21 / SPEC-20: tipo de cadastro, usuário ativo, admin da plataforma

alter table public.users
  add column if not exists ativo boolean not null default true;

alter table public.users
  add column if not exists plataforma_admin boolean not null default false;

alter table public.cadastros
  add column if not exists tipo text not null default 'autonomo';

alter table public.cadastros
  drop constraint if exists cadastros_tipo_check;

alter table public.cadastros
  add constraint cadastros_tipo_check check (tipo in ('autonomo', 'empresa'));

update public.users
set plataforma_admin = true
where email = 'admin@codenes.com.br';