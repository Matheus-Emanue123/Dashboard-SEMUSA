import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LinhaResultado } from '../materno-importacao/planilha.parser';
import { IndicadorViep, INDICADORES_VIEP, Observacao, PAINEIS_VIEP, Paineis } from './indicadores-viep';
import { PowerBiClient } from './powerbi.client';

const CHAVE_UNICA = 'periodo_referencia,codigo_indicador,tipo_atendimento,detalhamento';
const ANO_INICIAL_PADRAO = 2026;

export interface ResultadoSincronizacao {
  gravadas: number;
  indicadores: { codigo: string; linhas: number; erro?: string }[];
}

// Converte as observações de um indicador nas linhas da tabela materno_resultados.
export function paraLinhas(
  indicador: IndicadorViep,
  observacoes: Observacao[],
  fonte: string,
  ultimaAtualizacaoPainel: string | null,
  agora: string,
): LinhaResultado[] {
  return observacoes.map(o => ({
    periodo_referencia: o.periodo,
    codigo_indicador: indicador.codigo,
    tipo_atendimento: 'Geral',
    detalhamento: 'Sem detalhamento',
    // Fração crua (ou contagem); a escala de exibição fica no MAPEAMENTO_MATERNO.
    resultado: o.denominador === null ? o.numerador : o.numerador / o.denominador,
    numerador: o.numerador,
    denominador: o.denominador,
    unidade_medida: indicador.unidade,
    justificativa: null,
    relatorio_fonte: fonte,
    data_registro: ultimaAtualizacaoPainel ? ultimaAtualizacaoPainel.slice(0, 10) : null,
    area_responsavel: 'Vigilância Epidemiológica',
    situacao_dado: 'Coletado automaticamente do Power BI',
    atualizado_em: agora,
  }));
}

// Nenhum período pode ser posterior ao mês da última atualização do painel (protege contra
// datas digitadas erradas na fonte).
export function descartarFuturos(observacoes: Observacao[], limiteIso: string): Observacao[] {
  const limite = `${limiteIso.slice(0, 7)}-01`;
  return observacoes.filter(o => o.periodo <= limite);
}

@Injectable()
export class PowerBiViepService {
  private readonly logger = new Logger(PowerBiViepService.name);
  private readonly supabase: SupabaseClient;
  private emAndamento = false;

  constructor(private readonly client: PowerBiClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
    }
    this.supabase = createClient(url, key, { auth: { persistSession: false } });
  }

  private anoInicial() {
    const ano = Number(process.env.VIEP_ANO_INICIAL ?? ANO_INICIAL_PADRAO);
    return Number.isInteger(ano) && ano > 2000 ? ano : ANO_INICIAL_PADRAO;
  }

  // Toda segunda-feira às 6h (horário de Brasília). Desligável com VIEP_SINCRONIZACAO_ATIVA=false.
  @Cron('0 6 * * 1', { name: 'sincronizar-viep', timeZone: 'America/Sao_Paulo' })
  async sincronizacaoAgendada() {
    if (process.env.VIEP_SINCRONIZACAO_ATIVA === 'false') return;
    try {
      const r = await this.sincronizar();
      this.logger.log(`Sincronização VIEP concluída: ${r.gravadas} linhas gravadas.`);
    } catch (e) {
      this.logger.error(`Sincronização VIEP falhou: ${(e as Error).message}`);
    }
  }

  async sincronizar(): Promise<ResultadoSincronizacao> {
    if (this.emAndamento) throw new Error('Já existe uma sincronização VIEP em andamento.');
    this.emAndamento = true;
    try {
      return await this.executar();
    } finally {
      this.emAndamento = false;
    }
  }

  private async executar(): Promise<ResultadoSincronizacao> {
    const anoInicial = this.anoInicial();
    const paineis = Object.fromEntries(await Promise.all(
      Object.entries(PAINEIS_VIEP).map(async ([nome, p]) => [nome, await this.client.modelo(p.chave)]),
    )) as Paineis;
    const agora = new Date().toISOString();

    const resultado: ResultadoSincronizacao = { gravadas: 0, indicadores: [] };
    // Um indicador com erro não impede os outros; nada parcial é gravado para o indicador que falhou.
    for (const indicador of INDICADORES_VIEP) {
      try {
        const ultima = paineis[indicador.painel].ultimaAtualizacao;
        const observacoes = descartarFuturos(await indicador.coletar(this.client, paineis, anoInicial), ultima ?? agora);
        const linhas = paraLinhas(indicador, observacoes, PAINEIS_VIEP[indicador.painel].nome, ultima, agora);
        if (linhas.length) {
          const { error } = await this.supabase.from('materno_resultados').upsert(linhas, { onConflict: CHAVE_UNICA });
          if (error) throw new Error(`Erro ao gravar no Supabase: ${error.message}`);
        }
        resultado.gravadas += linhas.length;
        resultado.indicadores.push({ codigo: indicador.codigo, linhas: linhas.length });
      } catch (e) {
        const erro = (e as Error).message;
        this.logger.error(`${indicador.codigo}: ${erro}`);
        resultado.indicadores.push({ codigo: indicador.codigo, linhas: 0, erro });
      }
    }
    return resultado;
  }
}
