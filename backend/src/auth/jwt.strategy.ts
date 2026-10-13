import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
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
