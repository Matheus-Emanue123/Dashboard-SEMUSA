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
}
