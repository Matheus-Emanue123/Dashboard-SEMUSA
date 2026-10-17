import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ListUsersQuery } from './list-users.query';

const valido = {
  nome: 'Maria Souza',
  email: 'maria@semusa.gov.br',
  role: 'OPERADOR',
  senha: '1234567890',
};

const erros = async (cls: any, obj: object) =>
  (await validate(plainToInstance(cls, obj))).map((e) => e.property);

describe('CreateUserDto', () => {
  it('aceita um corpo válido sem unidade_saude', async () => {
    expect(await erros(CreateUserDto, valido)).toEqual([]);
  });

  it('rejeita senha de 9 caracteres', async () => {
    expect(await erros(CreateUserDto, { ...valido, senha: '123456789' })).toContain('senha');
  });

  it('rejeita role fora de ROLES', async () => {
    expect(await erros(CreateUserDto, { ...valido, role: 'SUPERUSER' })).toContain('role');
  });

  it('rejeita e-mail inválido', async () => {
    expect(await erros(CreateUserDto, { ...valido, email: 'nao-e-email' })).toContain('email');
  });
});

describe('ListUsersQuery', () => {
  it('rejeita pageSize 101', async () => {
    expect(await erros(ListUsersQuery, { pageSize: '101' })).toContain('pageSize');
  });

  it('rejeita page 0', async () => {
    expect(await erros(ListUsersQuery, { page: '0' })).toContain('page');
  });

  it('usa page 1 e pageSize 20 por padrão', async () => {
    const q = plainToInstance(ListUsersQuery, {});
    expect([q.page, q.pageSize]).toEqual([1, 20]);
  });
});
