import { SetMetadata } from '@nestjs/common';

export const ROLES = ['ADMIN', 'GESTOR', 'OPERADOR', 'VISUALIZADOR_UNIDADE'] as const;
export type Role = (typeof ROLES)[number];

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
