-- perfis passa a ser a fonte da role e da unidade
-- qualquer mudança nessas colunas é copiada para o app_metadata do usuário, que é o que vai no JWT

create or replace function public.sync_perfil_to_auth()
returns trigger as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', new.role, 'unidade_saude', new.unidade_saude)
  where id = new.id;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists on_perfil_changed on public.perfis;
create trigger on_perfil_changed
  after insert or update of role, unidade_saude on public.perfis
  for each row execute function public.sync_perfil_to_auth();

-- contas que já existem
update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', p.role, 'unidade_saude', p.unidade_saude)
from public.perfis p
where p.id = u.id;
