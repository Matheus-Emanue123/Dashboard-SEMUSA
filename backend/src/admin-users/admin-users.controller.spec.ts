import 'reflect-metadata';
import { ROLES_KEY } from '../auth/roles.decorator';
import { AdminUsersController } from './admin-users.controller';
import { FirstAccessController } from './first-access.controller';

const user = { userId: 'admin-1', email: 'admin@semusa.gov.br', role: 'ADMIN' };
const actor = { userId: 'admin-1', email: 'admin@semusa.gov.br' };

function makeService() {
  return {
    listar: jest.fn().mockResolvedValue('lista'),
    criar: jest.fn().mockResolvedValue('criado'),
    redefinirSenha: jest.fn().mockResolvedValue(undefined),
    alterarPapel: jest.fn().mockResolvedValue('papel'),
    alterarStatus: jest.fn().mockResolvedValue('status'),
    excluir: jest.fn().mockResolvedValue(undefined),
    trocarSenhaInicial: jest.fn().mockResolvedValue(undefined),
  };
}

describe('AdminUsersController', () => {
  it('exige a role ADMIN', () => {
    expect(Reflect.getMetadata(ROLES_KEY, AdminUsersController)).toEqual(['ADMIN']);
  });

  it('repassa o usuário logado como actor em cada operação', async () => {
    const service = makeService();
    const c = new AdminUsersController(service as any);

    await c.criar({ nome: 'n' } as any, user);
    await c.redefinirSenha('u-1', { senha: 'x' } as any, user);
    await c.alterarPapel('u-1', { role: 'GESTOR' } as any, user);
    await c.alterarStatus('u-1', { ativo: false }, user);
    await c.excluir('u-1', user);

    expect(service.criar).toHaveBeenCalledWith({ nome: 'n' }, actor);
    expect(service.redefinirSenha).toHaveBeenCalledWith('u-1', { senha: 'x' }, actor);
    expect(service.alterarPapel).toHaveBeenCalledWith('u-1', { role: 'GESTOR' }, actor);
    expect(service.alterarStatus).toHaveBeenCalledWith('u-1', { ativo: false }, actor);
    expect(service.excluir).toHaveBeenCalledWith('u-1', actor);
  });

  it('listar repassa a query ao service', async () => {
    const service = makeService();
    const c = new AdminUsersController(service as any);

    expect(await c.listar({ page: 2 } as any)).toBe('lista');
    expect(service.listar).toHaveBeenCalledWith({ page: 2 });
  });
});

describe('FirstAccessController', () => {
  it('não define roles: qualquer autenticado pode chamar', () => {
    expect(Reflect.getMetadata(ROLES_KEY, FirstAccessController)).toBeUndefined();
    expect(
      Reflect.getMetadata(ROLES_KEY, FirstAccessController.prototype.trocarSenhaInicial),
    ).toBeUndefined();
  });

  it('trocarSenhaInicial repassa o usuário logado como actor', async () => {
    const service = makeService();
    const c = new FirstAccessController(service as any);
    const maria = { userId: 'u-1', email: 'maria@semusa.gov.br', role: 'OPERADOR' };

    await c.trocarSenhaInicial({ senha: 'OutraSenha#789' }, maria);

    expect(service.trocarSenhaInicial).toHaveBeenCalledWith(
      { senha: 'OutraSenha#789' },
      { userId: 'u-1', email: 'maria@semusa.gov.br' },
    );
  });
});
