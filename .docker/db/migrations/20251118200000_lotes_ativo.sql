alter table public.lotes
  add column if not exists ativo boolean not null default true;