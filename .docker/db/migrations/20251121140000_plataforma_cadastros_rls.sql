-- SPEC-23: admin da plataforma pode gerir cadastros e membros (app.plataforma_admin)

drop policy if exists cadastros_select on public.cadastros;
create policy cadastros_select on public.cadastros
  for select
  using (
    id = public.current_cadastro_id()
    or coalesce(current_setting('app.plataforma_admin', true), '') = 'true'
  );

create policy cadastros_plataforma_all on public.cadastros
  for all
  using (coalesce(current_setting('app.plataforma_admin', true), '') = 'true')
  with check (coalesce(current_setting('app.plataforma_admin', true), '') = 'true');

drop policy if exists membros_select on public.membros_cadastro;
create policy membros_select on public.membros_cadastro
  for select
  using (
    cadastro_id = public.current_cadastro_id()
    or coalesce(current_setting('app.plataforma_admin', true), '') = 'true'
  );

create policy membros_plataforma_all on public.membros_cadastro
  for all
  using (coalesce(current_setting('app.plataforma_admin', true), '') = 'true')
  with check (coalesce(current_setting('app.plataforma_admin', true), '') = 'true');

grant insert, update, delete on public.users to inseminaai_app;