import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Workbook } from 'exceljs';
import { lerPlanilha, PlanilhaInvalidaError } from './planilha.parser';

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