import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('linhas-cuidado')
  linhasCuidado() {
    return this.service.linhasCuidado();
  }

  @Get('cobertura-mensal')
  coberturaMensal() {
    return this.service.coberturaMensal();
  }

  @Get('cobertura-linhas')
  coberturaLinhas() {
    return this.service.coberturaLinhas();
  }

  @Get('indicadores-atencao')
  indicadoresAtencao() {
    return this.service.indicadoresAtencao();
  }

  @Get('status-linhas')
  statusLinhas() {
    return this.service.statusLinhas();
  }

  @Get('avisos-qualidade')
  avisosQualidade() {
    return this.service.avisosQualidade();
  }

  @Get('fontes-ativas')
  fontesAtivas() {
    return this.service.fontesAtivas();
  }
}
