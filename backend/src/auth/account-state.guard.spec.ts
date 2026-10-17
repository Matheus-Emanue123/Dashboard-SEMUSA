import {
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountStateGuard } from './account-state.guard';

const PERFIL = {
  ativo: true,
  role: 'GESTOR',
  unidade_saude: null,
  deve_trocar_senha: false,
};

function makeGuard(result: { data: any; error: any }) {
  const maybeSingle = jest.fn().mockResolvedValue(result);
  const eq = jest.fn(() => ({ maybeSingle }));
  const select = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ select }));
  return { guard: new AccountStateGuard({ client: { from } } as any), from, eq };
}

function ctx(user: any, url = '/api/linhas-cuidado') {
  const req = { user, originalUrl: url };
  return {
    req,
    context: { switchToHttp: () => ({ getRequest: () => req }) } as any,
  };
}

const logado = () => ({ userId: 'u-1', email: 'a@b.c', role: 'ADMIN', unidade: null });

describe('AccountStateGuard', () => {
  it('deixa passar rota pública, sem usuário e sem consultar o banco', async () => {
    const { guard, from } = makeGuard({ data: PERFIL, error: null });

    await expect(guard.canActivate(ctx(undefined).context)).resolves.toBe(true);
    expect(from).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException quando a conta está bloqueada (ativo = false)', async () => {
    const { guard } = makeGuard({ data: { ...PERFIL, ativo: false }, error: null });

    await expect(guard.canActivate(ctx(logado()).context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('usa a role do banco no lugar da role do token (ADMIN rebaixado perde o acesso na hora)', async () => {
    const { guard } = makeGuard({ data: PERFIL, error: null });
    const { req, context } = ctx(logado());

    await guard.canActivate(context);

    expect((req.user as any).role).toBe('GESTOR');
  });

  it('lança UnauthorizedException quando o perfil não existe', async () => {
    const { guard } = makeGuard({ data: null, error: null });

    await expect(guard.canActivate(ctx(logado()).context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('lança ServiceUnavailableException quando a consulta falha (nunca libera por falha)', async () => {
    const { guard } = makeGuard({ data: null, error: { message: 'timeout' } });

    await expect(guard.canActivate(ctx(logado()).context)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('lança ForbiddenException numa rota comum enquanto deve_trocar_senha for verdadeiro', async () => {
    const { guard } = makeGuard({ data: { ...PERFIL, deve_trocar_senha: true }, error: null });

    await expect(guard.canActivate(ctx(logado(), '/api/linhas-cuidado?x=1').context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('libera /api/auth/trocar-senha-inicial e /api/auth/me mesmo com deve_trocar_senha', async () => {
    const { guard } = makeGuard({ data: { ...PERFIL, deve_trocar_senha: true }, error: null });

    await expect(guard.canActivate(ctx(logado(), '/api/auth/trocar-senha-inicial').context)).resolves.toBe(true);
    await expect(guard.canActivate(ctx(logado(), '/api/auth/me').context)).resolves.toBe(true);
  });
});
