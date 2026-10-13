-- registro de cada requisição feita à API (quem, o quê, quando e o resultado)

create table if not exists public.auditoria_acessos (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  user_id uuid,
  email text,
  role text,
  metodo text not null,
  rota text not null,
  status int not null,
  ip text
);

create index if not exists auditoria_acessos_criado_em_idx on public.auditoria_acessos (criado_em desc);
create index if not exists auditoria_acessos_user_id_idx on public.auditoria_acessos (user_id);

-- sem política: só o backend (chave secreta) grava e lê
alter table public.auditoria_acessos enable row level security;
