-- retenção dos logs: apaga registros com mais de 1 ano (LGPD: guardar só o tempo necessário)
-- as duas tabelas de auditoria não têm FK, então apagar daqui não afeta mais nada

create or replace function public.purgar_logs_antigos()
returns void as $$
begin
  delete from public.auditoria_acessos where criado_em < now() - interval '1 year';
  delete from public.auditoria_admin where criado_em < now() - interval '1 year';
end;
$$ language plpgsql security definer set search_path = '';

-- ninguém chama pela API: só o agendamento (ou o dono do banco, no SQL Editor)
revoke all on function public.purgar_logs_antigos() from public, anon, authenticated;

-- agenda a limpeza diária às 03:00 se a extensão pg_cron estiver habilitada
-- (Supabase: Database > Extensions > pg_cron). sem ela, a função continua disponível para rodar à mão
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'purgar-logs-antigos';
    perform cron.schedule('purgar-logs-antigos', '0 3 * * *', 'select public.purgar_logs_antigos()');
  else
    raise notice 'pg_cron não habilitada: habilite a extensão e rode esta migration de novo para agendar a limpeza';
  end if;
end $$;
