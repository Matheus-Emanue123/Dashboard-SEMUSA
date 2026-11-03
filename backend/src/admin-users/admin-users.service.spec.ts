import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';

const ADMIN = { userId: 'admin-1', email: 'admin@semusa.gov.br' };

const perfil = (over: object = {}) => ({
  id: 'u-1',
  nome: 'Maria Souza',
  email: 'maria@semusa.gov.br',
  role: 'OPERADOR',
  unidade_saude: null,
  ativo: true,
  deve_trocar_senha: false,
  criado_em: '2026-10-01T00:00:00Z',
  ...over,
});

// builder encadeável: cada método devolve o próprio builder e o await resolve com `result`
function builder(result: any) {
  const b: any = {};
  for (const m of ['select', 'order', 'range', 'or', 'eq', 'update']) b[m] = jest.fn(() => b);
  b.single = jest.fn(() => Promise.resolve(result));
  b.maybeSingle = jest.fn(() => Promise.resolve(result));
  b.then = (res: any, rej: any) => Promise.resolve(result).then(res, rej);
  return b;
}

// cada chamada a from('perfis') consome o próximo resultado da fila
function makeEnv(perfisResults: any[] = [], authOver: any = {}) {
  const builders: any[] = [];
  const queue = [...perfisResults];
  const from = jest.fn(() => {
    const b = builder(queue.shift() ?? { data: null, error: null });
    builders.push(b);
    return b;
  });
  const admin = {
    createUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u-1' } }, error: null }),
    updateUserById: jest.fn().mockResolvedValue({ data: {}, error: null }),
    deleteUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
    ...authOver,
  };
  const audit = { registrar: jest.fn().mockResolvedValue(undefined) };
  const service = new AdminUsersService({ client: { from, auth: { admin } } } as any, audit as any);
  return { service, from, builders, admin, audit };
}

const ok = (data: any) => ({ data, error: null });

describe('AdminUsersService.criar', () => {
  const dto: any = {
    nome: 'Maria Souza',
    email: '  Maria@Semusa.GOV.br ',
    role: 'OPERADOR',
    senha: 'SenhaTemp#123',
  };

  it('normaliza o e-mail, cria com email_confirm e app_metadata.role, marca deve_trocar_senha e audita CRIAR_USUARIO', async () => {
    const { service, admin, builders, audit } = makeEnv([ok(perfil({ deve_trocar_senha: true }))]);

    await service.criar(dto, ADMIN);

    expect(admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'maria@semusa.gov.br',
        password: 'SenhaTemp#123',
        email_confirm: true,
        app_metadata: { role: 'OPERADOR' },
      }),
    );
    expect(builders[0].update).toHaveBeenCalledWith(
      expect.objectContaining({ deve_trocar_senha: true, nome: 'Maria Souza' }),
    );
    expect(audit.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 'admin-1',
        alvoId: 'u-1',
        alvoEmail: 'maria@semusa.gov.br',
        operacao: 'CRIAR_USUARIO',
      }),
    );
  });

  it('apaga o usuário do Auth e lança erro quando a atualização do perfil falha', async () => {
    const { service, admin } = makeEnv([{ data: null, error: { message: 'falhou' } }]);

    await expect(service.criar(dto, ADMIN)).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(admin.deleteUser).toHaveBeenCalledWith('u-1');
  });

  it('lança ConflictException (409) quando o Auth responde que o e-mail já está cadastrado', async () => {
    const { service, audit } = makeEnv([], {
      createUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'A user with this email address has already been registered', status: 422 },
      }),
    });

    await expect(service.criar(dto, ADMIN)).rejects.toBeInstanceOf(ConflictException);
    expect(audit.registrar).not.toHaveBeenCalled();
  });

  it('não inclui a senha em nenhum argumento de registrar', async () => {
    const { service, audit } = makeEnv([ok(perfil())]);

    await service.criar(dto, ADMIN);

    expect(JSON.stringify(audit.registrar.mock.calls)).not.toContain('SenhaTemp#123');
  });

  it('inclui a role no update do perfil, para o trigger do banco não rebaixar a conta', async () => {
    const { service, builders } = makeEnv([ok(perfil({ role: 'ADMIN' }))]);

    await service.criar({ ...dto, role: 'ADMIN' }, ADMIN);

    expect(builders[0].update).toHaveBeenCalledWith(expect.objectContaining({ role: 'ADMIN' }));
  });

  it('registra em log quando o rollback (deleteUser) também falha', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { service } = makeEnv([{ data: null, error: { message: 'falhou' } }], {
      deleteUser: jest.fn().mockResolvedValue({ data: null, error: { message: 'sem rede' } }),
    });

    await expect(service.criar(dto, ADMIN)).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('u-1'));
    logSpy.mockRestore();
  });

  it('propaga o erro quando a auditoria falha', async () => {
    const { service, audit } = makeEnv([ok(perfil())]);
    audit.registrar.mockRejectedValue(new InternalServerErrorException());

    await expect(service.criar(dto, ADMIN)).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});

describe('AdminUsersService.alterarStatus', () => {
  it('ativo=false aplica ban_duration 876000h, atualiza perfis.ativo e audita ALTERAR_STATUS', async () => {
    const { service, admin, builders, audit } = makeEnv([ok(perfil()), ok(perfil({ ativo: false }))]);

    await service.alterarStatus('u-1', { ativo: false }, ADMIN);

    expect(admin.updateUserById).toHaveBeenCalledWith('u-1', { ban_duration: '876000h' });
    expect(builders[1].update).toHaveBeenCalledWith({ ativo: false });
    expect(audit.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ operacao: 'ALTERAR_STATUS', alvoId: 'u-1' }),
    );
  });

  it('ativo=true aplica ban_duration none', async () => {
    const { service, admin } = makeEnv([ok(perfil({ ativo: false })), ok(perfil())]);

    await service.alterarStatus('u-1', { ativo: true }, ADMIN);

    expect(admin.updateUserById).toHaveBeenCalledWith('u-1', { ban_duration: 'none' });
  });

  it('lança BadRequestException quando o admin tenta bloquear a si mesmo', async () => {
    const { service, admin } = makeEnv([ok(perfil({ id: 'admin-1' }))]);

    await expect(service.alterarStatus('admin-1', { ativo: false }, ADMIN)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(admin.updateUserById).not.toHaveBeenCalled();
  });

  it('lança NotFoundException quando o perfil não existe', async () => {
    const { service } = makeEnv([ok(null)]);

    await expect(service.alterarStatus('x', { ativo: false }, ADMIN)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('AdminUsersService.alterarPapel', () => {
  it('atualiza role e audita ALTERAR_PAPEL com o papel anterior e o novo', async () => {
    const { service, builders, audit } = makeEnv([ok(perfil()), ok(perfil({ role: 'GESTOR' }))]);

    await service.alterarPapel('u-1', { role: 'GESTOR' }, ADMIN);

    expect(builders[1].update).toHaveBeenCalledWith(expect.objectContaining({ role: 'GESTOR' }));
    expect(audit.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        operacao: 'ALTERAR_PAPEL',
        detalhes: expect.objectContaining({ de: 'OPERADOR', para: 'GESTOR' }),
      }),
    );
  });

  it('lança BadRequestException quando o admin muda o próprio papel', async () => {
    const { service } = makeEnv([ok(perfil({ id: 'admin-1', role: 'ADMIN' }))]);

    await expect(service.alterarPapel('admin-1', { role: 'GESTOR' }, ADMIN)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('lança NotFoundException quando o perfil não existe', async () => {
    const { service } = makeEnv([ok(null)]);

    await expect(service.alterarPapel('x', { role: 'GESTOR' }, ADMIN)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('AdminUsersService.redefinirSenha', () => {
  it('chama updateUserById com a senha, marca deve_trocar_senha e audita REDEFINIR_SENHA sem a senha', async () => {
    const { service, admin, builders, audit } = makeEnv([ok(perfil()), ok(null)]);

    await service.redefinirSenha('u-1', { senha: 'NovaSenha#456' }, ADMIN);

    expect(admin.updateUserById).toHaveBeenCalledWith('u-1', { password: 'NovaSenha#456' });
    expect(builders[1].update).toHaveBeenCalledWith({ deve_trocar_senha: true });
    expect(audit.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ operacao: 'REDEFINIR_SENHA' }),
    );
    expect(JSON.stringify(audit.registrar.mock.calls)).not.toContain('NovaSenha#456');
  });

  it('marca deve_trocar_senha no perfil antes de trocar a senha no Auth', async () => {
    const { service, admin, builders } = makeEnv([ok(perfil()), ok(null)]);

    await service.redefinirSenha('u-1', { senha: 'NovaSenha#456' }, ADMIN);

    const ordemPerfil = builders[1].update.mock.invocationCallOrder[0];
    const ordemAuth = admin.updateUserById.mock.invocationCallOrder[0];
    expect(ordemPerfil).toBeLessThan(ordemAuth);
  });
});

describe('AdminUsersService.trocarSenhaInicial', () => {
  const actor = { userId: 'u-1', email: 'maria@semusa.gov.br' };

  it('lança ForbiddenException quando deve_trocar_senha é false', async () => {
    const { service, admin } = makeEnv([ok(perfil({ deve_trocar_senha: false }))]);

    await expect(service.trocarSenhaInicial({ senha: 'OutraSenha#789' }, actor)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(admin.updateUserById).not.toHaveBeenCalled();
  });

  it('troca a senha, zera a flag e audita TROCA_SENHA_INICIAL quando a flag é true', async () => {
    const { service, admin, builders, audit } = makeEnv([
      ok(perfil({ deve_trocar_senha: true })),
      ok(null),
    ]);

    await service.trocarSenhaInicial({ senha: 'OutraSenha#789' }, actor);

    expect(admin.updateUserById).toHaveBeenCalledWith('u-1', { password: 'OutraSenha#789' });
    expect(builders[1].update).toHaveBeenCalledWith({ deve_trocar_senha: false });
    expect(audit.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ operacao: 'TROCA_SENHA_INICIAL', adminId: 'u-1', alvoId: 'u-1' }),
    );
    expect(JSON.stringify(audit.registrar.mock.calls)).not.toContain('OutraSenha#789');
  });
});

describe('AdminUsersService.excluir', () => {
  it('audita EXCLUIR_USUARIO com nome, e-mail e papel antes de apagar a conta no Auth', async () => {
    const { service, admin, audit } = makeEnv([ok(perfil({ nome: 'Maria Souza', role: 'GESTOR' }))]);

    await service.excluir('u-1', ADMIN);

    expect(audit.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        operacao: 'EXCLUIR_USUARIO',
        alvoId: 'u-1',
        alvoEmail: 'maria@semusa.gov.br',
        detalhes: expect.objectContaining({ nome: 'Maria Souza', role: 'GESTOR' }),
      }),
    );
    expect(admin.deleteUser).toHaveBeenCalledWith('u-1');
    expect(audit.registrar.mock.invocationCallOrder[0]).toBeLessThan(
      admin.deleteUser.mock.invocationCallOrder[0],
    );
  });

  it('lança BadRequestException quando o admin tenta excluir a si mesmo', async () => {
    const { service, admin, audit } = makeEnv([ok(perfil({ id: 'admin-1' }))]);

    await expect(service.excluir('admin-1', ADMIN)).rejects.toBeInstanceOf(BadRequestException);
    expect(audit.registrar).not.toHaveBeenCalled();
    expect(admin.deleteUser).not.toHaveBeenCalled();
  });

  it('lança NotFoundException quando o perfil não existe', async () => {
    const { service } = makeEnv([ok(null)]);

    await expect(service.excluir('x', ADMIN)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('não apaga a conta quando a auditoria falha', async () => {
    const { service, admin, audit } = makeEnv([ok(perfil())]);
    audit.registrar.mockRejectedValue(new InternalServerErrorException());

    await expect(service.excluir('u-1', ADMIN)).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(admin.deleteUser).not.toHaveBeenCalled();
  });

  it('lança InternalServerErrorException quando o Auth não consegue apagar a conta', async () => {
    const { service } = makeEnv([ok(perfil())], {
      deleteUser: jest.fn().mockResolvedValue({ data: null, error: { message: 'falhou' } }),
    });

    await expect(service.excluir('u-1', ADMIN)).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});

describe('AdminUsersService.listar', () => {
  const lista = { data: [perfil()], count: 1, error: null };

  it('calcula o range a partir de page e pageSize e devolve o total', async () => {
    const { service, builders } = makeEnv([lista]);

    const r = await service.listar({ page: 3, pageSize: 10 } as any);

    expect(builders[0].range).toHaveBeenCalledWith(20, 29);
    expect(r).toEqual({ itens: [perfil()], total: 1, page: 3, pageSize: 10 });
  });

  it('limita pageSize a 100 mesmo se o DTO for burlado', async () => {
    const { service, builders } = makeEnv([lista]);

    await service.listar({ page: 1, pageSize: 100000 } as any);

    expect(builders[0].range).toHaveBeenCalledWith(0, 99);
  });

  it('remove , ( ) % _ \\ da busca antes de montar o filtro .or', async () => {
    const { service, builders } = makeEnv([lista]);

    await service.listar({ page: 1, pageSize: 20, busca: 'ma,ri(a)%_\\' } as any);

    expect(builders[0].or).toHaveBeenCalledWith('nome.ilike.%maria%,email.ilike.%maria%');
  });

  it('não monta .or quando a busca fica vazia depois de sanitizada', async () => {
    const { service, builders } = makeEnv([lista]);

    await service.listar({ page: 1, pageSize: 20, busca: ',()%' } as any);

    expect(builders[0].or).not.toHaveBeenCalled();
  });

  it('filtra por papel quando informado', async () => {
    const { service, builders } = makeEnv([lista]);

    await service.listar({ page: 1, pageSize: 20, role: 'GESTOR' } as any);

    expect(builders[0].eq).toHaveBeenCalledWith('role', 'GESTOR');
  });
});
