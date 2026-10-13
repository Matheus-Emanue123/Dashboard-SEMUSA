import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './dashboard/dashboard.module';
import { MaternoImportacaoModule } from './materno-importacao/materno-importacao.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DashboardModule, MaternoImportacaoModule],
})
export class AppModule {}
