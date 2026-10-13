import { Module } from '@nestjs/common';
import { MaternoImportacaoController } from './materno-importacao.controller';
import { MaternoImportacaoService } from './materno-importacao.service';

@Module({
  controllers: [MaternoImportacaoController],
  providers: [MaternoImportacaoService],
})
export class MaternoImportacaoModule {}