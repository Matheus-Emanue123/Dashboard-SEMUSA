-- tabela de perfis ligada ao auth.users + trigger que grava a role no JWT

-- perfis
create table if not exists public.perfis (
  id uuid references auth.users(id) on delete cascade primary key,
  nome text not null,
  email text not null,
  role text not null check (role in ('ADMIN', 'GESTOR', 'OPERADOR', 'VISUALIZADOR_UNIDADE')) default 'VISUALIZADOR_UNIDADE',
  unidade_saude text,
  criado_em timestamptz default now()
);

-- RLS
alter table public.perfis enable row level security;

-- cada usuário só lê o próprio perfil
drop policy if exists "Usuarios podem ver seu proprio perfil" on public.perfis;
create policy "Usuarios podem ver seu proprio perfil"
on public.perfis for select
to authenticated
using (auth.uid() = id);

-- cria o perfil e grava a role quando um usuário é criado
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, email, nome, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_app_meta_data->>'role', 'VISUALIZADOR_UNIDADE')
  )
  on conflict (id) do nothing;
  
  -- a role precisa estar no app_metadata para sair no JWT
  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(coalesce(new.raw_app_meta_data->>'role', 'VISUALIZADOR_UNIDADE'))
  )
  where id = new.id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
