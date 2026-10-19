import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Workbook } from 'exceljs';
import { lerPlanilha, PlanilhaInvalidaError, LinhaResultado } from './planilha.parser';

import { construirResultados, MAPEAMENTO_MATERNO } from './materno-resultados';

const TAMANHO_LOTE = 500;
const CHAVE_UNICA = 'periodo_referencia,codigo_indicador,tipo_atendimento,detalhamento';

@Injectable()
export class MaternoImportacaoService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
    }
    this.supabase = createClient(url, key, { auth: { persistSession: false } });
  }

  async resultados() {
    const rows: LinhaResultado[] = [];
    // Paginação explícita: o limite padrão do PostgREST não pode truncar o histórico.
    for (let offset = 0; ; offset += TAMANHO_LOTE) {
      const { data, error } = await this.supabase.from('materno_resultados')
        .select('periodo_referencia,codigo_indicador,tipo_atendimento,detalhamento,resultado,numerador,denominador,relatorio_fonte,atualizado_em')
        .in('codigo_indicador', Object.keys(MAPEAMENTO_MATERNO))
        .order('periodo_referencia').order('codigo_indicador').order('tipo_atendimento').order('detalhamento')
        .range(offset, offset + TAMANHO_LOTE - 1);
      if (error) throw new InternalServerErrorException('Não foi possível consultar os resultados materno-infantis.');
      rows.push(...(data ?? []) as LinhaResultado[]);
      if (!data || data.length < TAMANHO_LOTE) break;
    }
    return construirResultados(rows);
  }

  async importar(buffer: Buffer) {
    const wb = new Workbook();
    try {
      await wb.xlsx.load(buffer as any);
    } catch {
      throw new BadRequestException('Não foi possível abrir o arquivo. Envie um .xlsx válido.');
    }

    let leitura;
    try {
      leitura = lerPlanilha(wb, new Date().toISOString());
    } catch (e) {
      if (e instanceof PlanilhaInvalidaError) throw new BadRequestException(e.message);
      throw e;
    }

    // Se qualquer linha estiver errada, não grava nada.
    if (leitura.erros.length > 0) {
      throw new BadRequestException({
        message: 'A planilha tem linhas com erro. Nada foi importado.',
        erros: leitura.erros,
      });
    }
    if (leitura.linhas.length === 0) {
      throw new BadRequestException('Nenhuma linha de dados encontrada na planilha.');
    }

    for (let i = 0; i < leitura.linhas.length; i += TAMANHO_LOTE) {
      const lote = leitura.linhas.slice(i, i + TAMANHO_LOTE);
      const { error } = await this.supabase
        .from('materno_resultados')
        .upsert(lote, { onConflict: CHAVE_UNICA });
      if (error) {
        throw new InternalServerErrorException(
          `Erro ao gravar no Supabase (lote ${i / TAMANHO_LOTE + 1}): ${error.message}`,
        );
      }
    }

    return {
      importadas: leitura.linhas.length,
      ignoradas: leitura.ignoradas,
    };
  }
}