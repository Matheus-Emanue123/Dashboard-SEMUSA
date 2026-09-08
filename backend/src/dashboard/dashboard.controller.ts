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

  @Get('indicadores')
  indicadores() {
    return this.service.indicadores();
  }

  @Get('catalogo-grupos')
  catalogoGrupos() {
    return this.service.catalogoGrupos();
  }

  @Get('status-styles')
  statusStyles() {
    return this.service.statusStyles();
  }

  @Get('localizacoes')
  localizacoes() {
    return this.service.localizacoes();
  }

  @Get('page-meta')
  pageMeta() {
    return this.service.pageMeta();
  }

  @Get('stage-defs')
  stageDefs() {
    return this.service.stageDefs();
  }

  @Get('materno/jornada')
  maternoJornada() {
    return this.service.maternoJornada();
  }

  @Get('materno/cobertura-etapas')
  maternoCoberturaEtapas() {
    return this.service.maternoCoberturaEtapas();
  }

  @Get('materno/cobertura-ubs')
  maternoCoberturaUbs() {
    return this.service.maternoCoberturaUbs();
  }

  @Get('cancer/fluxo')
  cancerFluxo() {
    return this.service.cancerFluxo();
  }

  @Get('cancer/funil')
  cancerFunil() {
    return this.service.cancerFunil();
  }

  @Get('navegacao/niveis-rede')
  navegacaoNiveisRede() {
    return this.service.navegacaoNiveisRede();
  }

  @Get('navegacao/tempo-espera')
  navegacaoTempoEspera() {
    return this.service.navegacaoTempoEspera();
  }

  @Get('navegacao/acesso')
  navegacaoAcesso() {
    return this.service.navegacaoAcesso();
  }

  @Get('conexao/kpis')
  conexaoKpis() {
    return this.service.conexaoKpis();
  }

  @Get('conexao/grupos')
  conexaoGrupos() {
    return this.service.conexaoGrupos();
  }

  @Get('conexao/historico')
  conexaoHistorico() {
    return this.service.conexaoHistorico();
  }

  @Get('ods/scores')
  odsScores() {
    return this.service.odsScores();
  }

  @Get('ods/paineis')
  odsPaineis() {
    return this.service.odsPaineis();
  }
}
