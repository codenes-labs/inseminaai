-- Role de aplicacao sem BYPASSRLS (usuario do compose e superuser em dev).

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

do $$
begin
  execute format('grant inseminaai_app to %I', current_user);
end
$$;