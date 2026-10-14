-- liga RLS em todas as tabelas do schema public
-- sem política de leitura, a chave pública não acessa nada; o backend usa a chave secreta, que ignora RLS

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;
