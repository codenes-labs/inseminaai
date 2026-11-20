alter table public.inseminacoes
  add column if not exists importacao_chave text;

create unique index if not exists idx_inseminacoes_importacao_chave
  on public.inseminacoes (cadastro_id, importacao_chave)
  where importacao_chave is not null;