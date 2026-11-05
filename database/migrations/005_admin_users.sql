-- painel administrativo de usuários: estado da conta em perfis e trilha de auditoria das ações do admin

-- ativo: espelho do bloqueio aplicado no Supabase Auth (ban_duration)
-- deve_trocar_senha: força o popup de troca de senha no próximo login
alter table public.perfis add column if not exists ativo boolean not null default true;
alter table public.perfis add column if not exists deve_trocar_senha boolean not null default false;

-- registro de cada ação administrativa (quem fez, em quem, o quê e quando)
create table if not exists public.auditoria_admin (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  admin_id uuid not null,
  admin_email text,
  alvo_id uuid,
  alvo_email text,
  operacao text not null check (operacao in (
    'CRIAR_USUARIO',
    'ALTERAR_PAPEL',
    'ALTERAR_STATUS',
    'REDEFINIR_SENHA',
    'TROCA_SENHA_INICIAL'
  )),
  detalhes jsonb
);

create index if not exists auditoria_admin_criado_em_idx on public.auditoria_admin (criado_em desc);
create index if not exists auditoria_admin_alvo_id_idx on public.auditoria_admin (alvo_id);

-- sem política: só o backend (chave secreta) grava e lê
alter table public.auditoria_admin enable row level security;
