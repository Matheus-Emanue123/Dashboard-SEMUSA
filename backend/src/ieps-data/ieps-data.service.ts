import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extrairObservacoes, INDICADORES_IEPS, paraLinhas } from './indicadores-ieps';
import { IepsClient } from './ieps.client';

const CHAVE_UNICA = 'periodo_referencia,codigo_indicador,tipo_atendimento,detalhamento';

export interface ResultadoSincronizacao {
  gravadas: number;
  indicadores: { codigo: string; linhas: number; erro?: string }[];
}

@Injectable()
export class IepsDataService {
  private readonly logger = new Logger(IepsDataService.name);
  private readonly supabase: SupabaseClient;
  private emAndamento = false;

  constructor(private readonly client: IepsClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
    }
    this.supabase = createClient(url, key, { auth: { persistSession: false } });
  }

  // O IEPS atualiza poucas vezes por ano: roda todo dia 5, às 6h (horário de Brasília).
  // Desligável com IEPS_SINCRONIZACAO_ATIVA=false.
  @Cron('0 6 5 * *', { name: 'sincronizar-ieps', timeZone: 'America/Sao_Paulo' })
  async sincronizacaoAgendada() {
    if (process.env.IEPS_SINCRONIZACAO_ATIVA === 'false') return;
    try {
      const r = await this.sincronizar();
      this.logger.log(`Sincronização IEPS concluída: ${r.gravadas} linhas gravadas.`);
    } catch (e) {
      this.logger.error(`Sincronização IEPS falhou: ${(e as Error).message}`);
    }
  }

  async sincronizar(): Promise<ResultadoSincronizacao> {
    if (this.emAndamento) throw new Error('Já existe uma sincronização IEPS em andamento.');
    this.emAndamento = true;
    try {
      return await this.executar();
    } finally {
      this.emAndamento = false;
    }
  }

  private async executar(): Promise<ResultadoSincronizacao> {
    // Se o download ou o formato do CSV falhar, nada é gravado.
    const observacoes = extrairObservacoes(await this.client.baixarCsv());
    const agora = new Date().toISOString();
    const resultado: ResultadoSincronizacao = { gravadas: 0, indicadores: [] };
    for (const indicador of INDICADORES_IEPS) {
      try {
        const linhas = paraLinhas(indicador, observacoes.get(indicador.codigo) ?? [], agora);
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
