import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../dashboard/supabase.service';

export type AdminOperacao =
  | 'CRIAR_USUARIO'
  | 'ALTERAR_PAPEL'
  | 'ALTERAR_STATUS'
  | 'REDEFINIR_SENHA'
  | 'TROCA_SENHA_INICIAL'
  | 'EXCLUIR_USUARIO';

export interface AdminAuditEntrada {
  adminId: string;
  adminEmail?: string;
  alvoId: string;
  alvoEmail?: string;
  operacao: AdminOperacao;
  detalhes?: Record<string, unknown>;
}

@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger('AuditoriaAdmin');

  constructor(private readonly supabase: SupabaseService) {}

  // diferente do log de requisições, aqui a trilha é obrigatória: se não gravar, a operação falha
  async registrar(entrada: AdminAuditEntrada): Promise<void> {
    const { error } = await this.supabase.client.from('auditoria_admin').insert({
      admin_id: entrada.adminId,
      admin_email: entrada.adminEmail ?? null,
      alvo_id: entrada.alvoId,
      alvo_email: entrada.alvoEmail ?? null,
      operacao: entrada.operacao,
      detalhes: entrada.detalhes ?? null,
    });

    if (error) {
      this.logger.error(
        `falha ao auditar ${entrada.operacao} (admin ${entrada.adminId}, alvo ${entrada.alvoId}): ${error.message}`,
      );
      throw new InternalServerErrorException('Não foi possível registrar a auditoria da operação');
    }
  }
}
