-- SPEC-23: cadastros seed autônomos ficam com um único membro (admin + demo).

delete from public.membros_cadastro
where cadastro_id = '00000000-0000-4000-8000-000000000001'
  and user_id <> '00000000-0000-4000-9000-000000000001';

delete from public.membros_cadastro
where cadastro_id = '00000000-0000-4000-8000-000000000002'
  and user_id <> '00000000-0000-4000-9000-000000000002';

update public.cadastros
set tipo = 'autonomo'
where id in (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);