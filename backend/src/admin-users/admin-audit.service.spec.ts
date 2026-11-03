import { InternalServerErrorException } from '@nestjs/common';
import { AdminAuditService } from './admin-audit.service';

function makeService(error: { message: string } | null = null) {
  const insert = jest.fn().mockResolvedValue({ error });
  const from = jest.fn().mockReturnValue({ insert });
  const service = new AdminAuditService({ client: { from } } as any);
  return { service, from, insert };
}

describe('AdminAuditService', () => {
  it('registrar grava admin_id, alvo_id, operacao e detalhes na tabela auditoria_admin', async () => {
    const { service, from, insert } = makeService();

    await service.registrar({
      adminId: 'admin-1',
      adminEmail: 'admin@semusa.gov.br',
      alvoId: 'alvo-1',
      alvoEmail: 'maria@semusa.gov.br',
      operacao: 'ALTERAR_PAPEL',
      detalhes: { de: 'OPERADOR', para: 'GESTOR' },
    });

    expect(from).toHaveBeenCalledWith('auditoria_admin');
    expect(insert).toHaveBeenCalledWith({
      admin_id: 'admin-1',
      admin_email: 'admin@semusa.gov.br',
      alvo_id: 'alvo-1',
      alvo_email: 'maria@semusa.gov.br',
      operacao: 'ALTERAR_PAPEL',
      detalhes: { de: 'OPERADOR', para: 'GESTOR' },
    });
  });

  it('registrar lança InternalServerErrorException quando o insert falha', async () => {
    const { service } = makeService({ message: 'boom' });

    await expect(
      service.registrar({ adminId: 'a', alvoId: 'b', operacao: 'CRIAR_USUARIO' }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
