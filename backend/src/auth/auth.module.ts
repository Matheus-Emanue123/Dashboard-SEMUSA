import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AccountStateGuard } from './account-state.guard';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), DashboardModule],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    // guards globais: toda rota exige login, e @Roles() restringe por role.
    // a ordem importa, o RolesGuard depende do usuário que o JwtAuthGuard coloca na requisição
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // confere o estado atual da conta no banco e corrige a role antes do RolesGuard
    { provide: APP_GUARD, useClass: AccountStateGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [PassportModule],
})
export class AuthModule {}
