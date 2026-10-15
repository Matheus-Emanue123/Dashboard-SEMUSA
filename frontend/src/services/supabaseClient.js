import { createClient } from '@supabase/supabase-js';

// aceita a URL com ou sem o /rest/v1 no final
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '')
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Dashboard SEMUSA] Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
