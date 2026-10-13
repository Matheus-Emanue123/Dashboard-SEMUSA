import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const esperada = process.env.IMPORT_API_KEY;
    const recebida = context.switchToHttp().getRequest().headers['x-api-key'];
    if (!esperada || recebida !== esperada) {
      throw new UnauthorizedException('Chave de importação inválida.');
    }
    return true;
  }
}