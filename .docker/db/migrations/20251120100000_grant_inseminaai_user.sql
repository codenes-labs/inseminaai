-- Neon: usuário de conexão do Worker (`inseminaai_user`). Dev Docker usa `inseminaai`.

do $$
begin
  if exists (select 1 from pg_catalog.pg_roles where rolname = 'inseminaai_user') then
    execute 'grant inseminaai_app to inseminaai_user';
  end if;
end
$$;