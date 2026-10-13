import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

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

    // O Supabase armazena permissões em app_metadata ou user_metadata
    const role =
      payload.app_metadata?.role ||
      payload.user_metadata?.role ||
      payload.user_role ||
      'VISUALIZADOR_UNIDADE';

    return {
      userId: payload.sub,
      email: payload.email,
      role: role,
      metadata: payload.user_metadata || {},
    };
  }
}
