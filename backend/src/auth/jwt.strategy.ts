import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { Role, ROLES } from './roles.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const authUrl =
      config
        .getOrThrow<string>('SUPABASE_URL')
        .replace(/\/rest\/v1\/?$/, '')
        .replace(/\/+$/, '') + '/auth/v1';

    // o Supabase assina os tokens com ES256; a chave pública vem do JWKS do projeto
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['ES256'],
      issuer: authUrl,
      audience: 'authenticated',
      secretOrKeyProvider: passportJwtSecret({
        jwksUri: `${authUrl}/.well-known/jwks.json`,
        cache: true,
        rateLimit: true,
      }),
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    // só o app_metadata vale: o user_metadata pode ser alterado pelo próprio usuário
    const claimed = payload.app_metadata?.role;
    const role: Role = ROLES.includes(claimed) ? claimed : 'VISUALIZADOR_UNIDADE';

    return {
      userId: payload.sub,
      email: payload.email,
      role,
      metadata: payload.user_metadata || {},
    };
  }
}
