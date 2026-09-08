import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class DashboardService {
  constructor(private readonly supabase: SupabaseService) {}

  // GET /api/linhas-cuidado -> substitui LINE_SUMMARY_CARDS
  async linhasCuidado() {
    const { data, error } = await this.supabase.client
      .from('linhas_cuidado')
      .select('id, label, count, color, background')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/cobertura-mensal -> substitui COVERAGE_SERIES
  async coberturaMensal() {
    const { data, error } = await this.supabase.client
      .from('cobertura_mensal')
      .select('mes, materno, cancer, navegacao, conexao')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/cobertura-linhas -> substitui COVERAGE_LINES
  async coberturaLinhas() {
    const { data, error } = await this.supabase.client
      .from('cobertura_linhas')
      .select('data_key, name, color, gradient_id');
    if (error) throw error;
    // camelCase pra bater com o que o CoverageChart.jsx espera (dataKey, gradientId)
    return data.map((linha) => ({
      dataKey: linha.data_key,
      name: linha.name,
      color: linha.color,
      gradientId: linha.gradient_id,
    }));
  }

  // GET /api/indicadores-atencao -> substitui ATTENTION_INDICATORS
  async indicadoresAtencao() {
    const { data, error } = await this.supabase.client
      .from('indicadores_atencao')
      .select('label, linha, status')
      .order('ordem');
    if (error) throw error;
    // o frontend usa a chave "line", não "linha"
    return data.map((item) => ({
      label: item.label,
      line: item.linha,
      status: item.status,
    }));
  }

  // GET /api/status-linhas -> substitui LINE_STATUS
  async statusLinhas() {
    const { data, error } = await this.supabase.client
      .from('status_linhas')
      .select('linha, ok, alert, worsening, color')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/avisos-qualidade -> substitui QUALITY_NOTICES
  async avisosQualidade() {
    const { data, error } = await this.supabase.client
      .from('avisos_qualidade')
      .select('mensagem')
      .order('ordem');
    if (error) throw error;
    return data.map((aviso) => aviso.mensagem);
  }

  // GET /api/fontes-ativas -> substitui ACTIVE_SOURCES
  async fontesAtivas() {
    const { data, error } = await this.supabase.client
      .from('fontes_ativas')
      .select('nome')
      .order('ordem');
    if (error) throw error;
    return data.map((fonte) => fonte.nome);
  }

  // GET /api/indicadores -> substitui ALL_INDICATORS / CATALOG_INDICATORS
  async indicadores() {
    const { data, error } = await this.supabase.client
      .from('indicadores')
      .select(
        'id, name, line, value, unit, parameter, status, trend, period, source, formula, definition, frequency, limitations, stage_id, is_catalog_item, is_highlight_card',
      )
      .order('ordem');
    if (error) throw error;
    return data.map((item) => ({
      id: item.id,
      name: item.name,
      line: item.line,
      value: item.value,
      unit: item.unit,
      parameter: item.parameter,
      status: item.status,
      trend: item.trend,
      period: item.period,
      source: item.source,
      formula: item.formula,
      definition: item.definition,
      frequency: item.frequency,
      limitations: item.limitations,
      stageId: item.stage_id,
      isCatalogItem: item.is_catalog_item,
      isHighlightCard: item.is_highlight_card,
    }));
  }

  // GET /api/catalogo-grupos -> substitui CATALOG_GROUPS
  async catalogoGrupos() {
    const { data, error } = await this.supabase.client
      .from('catalog_groups')
      .select('id, label')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/status-styles -> substitui STATUS_STYLES
  async statusStyles() {
    const { data, error } = await this.supabase.client
      .from('status_styles')
      .select('status_key, color, background, symbol, label, description')
      .order('ordem');
    if (error) throw error;
    return data.reduce((acc, item) => {
      acc[item.status_key] = {
        color: item.color,
        background: item.background,
        symbol: item.symbol,
        label: item.label,
        description: item.description,
      };
      return acc;
    }, {});
  }

  // GET /api/localizacoes -> substitui LOCATION_OPTIONS
  async localizacoes() {
    const { data, error } = await this.supabase.client
      .from('location_options')
      .select('nome')
      .order('ordem');
    if (error) throw error;
    return data.map((loc) => loc.nome);
  }

  // GET /api/page-meta -> substitui PAGE_META
  async pageMeta() {
    const { data, error } = await this.supabase.client
      .from('page_meta')
      .select('page_key, title, subtitle')
      .order('ordem');
    if (error) throw error;
    return data.reduce((acc, item) => {
      acc[item.page_key] = { title: item.title, subtitle: item.subtitle };
      return acc;
    }, {});
  }

  // GET /api/stage-defs -> substitui MATERNO_STAGE_DEFS / CANCER_STAGE_DEFS / etc. (indicatorStages.js)
  async stageDefs() {
    const { data, error } = await this.supabase.client
      .from('stage_defs')
      .select('line, stage_id, label, color')
      .order('ordem');
    if (error) throw error;
    return data.reduce((acc, item) => {
      if (!acc[item.line]) acc[item.line] = [];
      acc[item.line].push({ id: item.stage_id, label: item.label, color: item.color });
      return acc;
    }, {});
  }

  // GET /api/materno/jornada -> substitui MATERNO_JOURNEY
  async maternoJornada() {
    const { data, error } = await this.supabase.client
      .from('materno_journey')
      .select('n, label, color, items')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/materno/cobertura-etapas -> substitui MATERNO_STAGE_COVERAGE
  async maternoCoberturaEtapas() {
    const { data, error } = await this.supabase.client
      .from('materno_stage_coverage')
      .select('etapa, valor')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/materno/cobertura-ubs -> substitui MATERNO_UBS_COVERAGE
  async maternoCoberturaUbs() {
    const { data, error } = await this.supabase.client
      .from('materno_ubs_coverage')
      .select('ubs, pn, vac')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/cancer/fluxo -> substitui CANCER_FLOW
  async cancerFluxo() {
    const { data, error } = await this.supabase.client
      .from('cancer_flow')
      .select('label, color, items')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/cancer/funil -> substitui CANCER_FUNNEL
  async cancerFunil() {
    const { data, error } = await this.supabase.client
      .from('cancer_funnel')
      .select('etapa, n, color')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/navegacao/niveis-rede -> substitui NETWORK_LEVELS
  async navegacaoNiveisRede() {
    const { data, error } = await this.supabase.client
      .from('network_levels')
      .select('nivel, consultas, encaminhamentos, color')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/navegacao/tempo-espera -> substitui WAIT_TIME_SERIES
  async navegacaoTempoEspera() {
    const { data, error } = await this.supabase.client
      .from('wait_time_series')
      .select('mes, espera, meta')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/navegacao/acesso -> substitui ACCESS_BARS
  async navegacaoAcesso() {
    const { data, error } = await this.supabase.client
      .from('access_bars')
      .select('label, value, meta, color')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/conexao/kpis -> substitui CONEXAO_KPIS
  async conexaoKpis() {
    const { data, error } = await this.supabase.client
      .from('conexao_kpis')
      .select('label, value, color, icon')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/conexao/grupos -> substitui CONEXAO_GROUPS
  async conexaoGrupos() {
    const { data, error } = await this.supabase.client
      .from('conexao_groups')
      .select('grupo, cobertura, meta')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/conexao/historico -> substitui CONEXAO_HISTORY
  async conexaoHistorico() {
    const { data, error } = await this.supabase.client
      .from('conexao_history')
      .select('mes, pbf, sisvan')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/ods/scores -> substitui ODS_SCORES
  async odsScores() {
    const { data, error } = await this.supabase.client
      .from('ods_scores')
      .select('ods, score, meta')
      .order('ordem');
    if (error) throw error;
    return data;
  }

  // GET /api/ods/paineis -> substitui ODS_PANELS (junta ods_panels + ods_panel_indicadores)
  async odsPaineis() {
    const [
      { data: panels, error: panelsError },
      { data: indicadores, error: indicadoresError },
    ] = await Promise.all([
      this.supabase.client.from('ods_panels').select('ods, titulo, cor').order('ordem'),
      this.supabase.client
        .from('ods_panel_indicadores')
        .select('panel_ods, name, value, status, trend, meta')
        .order('ordem'),
    ]);
    if (panelsError) throw panelsError;
    if (indicadoresError) throw indicadoresError;

    return panels.map((panel) => ({
      ods: panel.ods,
      titulo: panel.titulo,
      cor: panel.cor,
      indicadores: indicadores
        .filter((item) => item.panel_ods === panel.ods)
        .map(({ name, value, status, trend, meta }) => ({ name, value, status, trend, meta })),
    }));
  }
}
