import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../dashboard/supabase.service';
import { Role, ROLES } from './roles.decorator';

// enquanto deve_trocar_senha estiver ligado, só estas rotas respondem
const ROTAS_LIBERADAS = ['/api/auth/trocar-senha-inicial', '/api/auth/me'];

// confere no banco, a cada requisição, o estado atual da conta. o token continua válido depois de
// bloquear ou rebaixar alguém, então a verdade vem de perfis e não do JWT
@Injectable()
export class AccountStateGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // rota @Public: não há usuário para conferir
    if (!user?.userId) return true;

    const { data: perfil, error } = await this.supabase.client
      .from('perfis')
      .select('ativo,role,unidade_saude,deve_trocar_senha')
      .eq('id', user.userId)
      .maybeSingle();

    // falha na consulta nunca libera o acesso
    if (error) throw new ServiceUnavailableException('Não foi possível validar a conta');
    if (!perfil) throw new UnauthorizedException('Conta não encontrada');
    if (!perfil.ativo) throw new UnauthorizedException('Conta bloqueada');

    user.role = (ROLES as readonly string[]).includes(perfil.role)
      ? (perfil.role as Role)
      : 'VISUALIZADOR_UNIDADE';
    user.unidade = perfil.unidade_saude ?? null;

    if (perfil.deve_trocar_senha) {
      const rota = String(req.originalUrl ?? '').split('?')[0].replace(/\/+$/, '');
      if (!ROTAS_LIBERADAS.includes(rota)) {
        throw new ForbiddenException('Troca de senha obrigatória no primeiro acesso');
      }
    }

    return true;
  }
}
