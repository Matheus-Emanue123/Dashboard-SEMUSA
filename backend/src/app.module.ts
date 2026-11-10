import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardModule } from './dashboard/dashboard.module';
import { MaternoImportacaoModule } from './materno-importacao/materno-importacao.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { PowerBiViepModule } from './powerbi-viep/powerbi-viep.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    // no máximo 100 requisições por minuto por IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AuthModule,
    AuditModule,
    DashboardModule,
    AdminUsersModule,
    MaternoImportacaoModule,
    // job semanal que coleta os indicadores dos painéis Power BI da VIEP
    ScheduleModule.forRoot(),
    PowerBiViepModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
