import { apiFetch } from './api';

const json = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export function listUsers({ page = 1, pageSize = 20, busca = '', role = '' } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (busca) params.set('busca', busca);
  if (role) params.set('role', role);
  return apiFetch(`/admin/users?${params}`);
}

export const createUser = (body) => apiFetch('/admin/users', json('POST', body));

export const resetPassword = (id, senha) =>
  apiFetch(`/admin/users/${id}/password`, json('PATCH', { senha }));

export const changeRole = (id, body) => apiFetch(`/admin/users/${id}/role`, json('PATCH', body));

export const changeStatus = (id, ativo) =>
  apiFetch(`/admin/users/${id}/status`, json('PATCH', { ativo }));

export const deleteUser = (id) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' });

// primeiro acesso: o próprio usuário define a senha definitiva
export const changeInitialPassword = (senha) =>
  apiFetch('/auth/trocar-senha-inicial', json('POST', { senha }));
