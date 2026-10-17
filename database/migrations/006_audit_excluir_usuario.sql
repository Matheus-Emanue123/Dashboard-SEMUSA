-- permite registrar a exclusão de contas na trilha de auditoria do admin

alter table public.auditoria_admin drop constraint if exists auditoria_admin_operacao_check;
alter table public.auditoria_admin add constraint auditoria_admin_operacao_check check (operacao in (
  'CRIAR_USUARIO',
  'ALTERAR_PAPEL',
  'ALTERAR_STATUS',
  'REDEFINIR_SENHA',
  'TROCA_SENHA_INICIAL',
  'EXCLUIR_USUARIO'
));
