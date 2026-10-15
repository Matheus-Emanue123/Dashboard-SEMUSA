import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SupabaseService } from '../dashboard/supabase.service';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Auditoria');

  constructor(private readonly supabase: SupabaseService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // grava só depois da resposta, quando o status e o usuário (se houver) já são conhecidos.
    // falha ao gravar não pode derrubar a requisição
    res.on('finish', () => {
      const user = (req as any).user;

      this.supabase.client
        .from('auditoria_acessos')
        .insert({
          user_id: user?.userId ?? null,
          email: user?.email ?? null,
          role: user?.role ?? null,
          metodo: req.method,
          rota: req.originalUrl.split('?')[0],
          status: res.statusCode,
          ip: req.ip ?? null,
        })
        .then(({ error }) => {
          if (error) this.logger.error(`não foi possível registrar o acesso: ${error.message}`);
        });
    });

    next();
  }
}
