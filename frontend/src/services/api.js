import { supabase } from './supabaseClient';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

// chamada à API do backend já com o token da sessão
export async function apiFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `Erro ${res.status} na API`);
    err.status = res.status;
    err.erros = body.erros;
    throw err;
  }

  return res.status === 204 ? null : res.json();
}
