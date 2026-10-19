import { Cell, Workbook, Worksheet } from 'exceljs';

export class PlanilhaInvalidaError extends Error {}

export interface LinhaResultado {
  periodo_referencia: string;
  codigo_indicador: string;
  tipo_atendimento: string;
  detalhamento: string;
  resultado: number;
  numerador: number | null;
  denominador: number | null;
  unidade_medida: string | null;
  justificativa: string | null;
  relatorio_fonte: string | null;
  data_registro: string | null;
  area_responsavel: string | null;
  situacao_dado: string | null;
  atualizado_em: string;
}

export interface ErroLinha {
  linha: number;
  motivo: string;
}

export interface ResultadoLeitura {
  linhas: LinhaResultado[];
  erros: ErroLinha[];
  ignoradas: number;
}

const ABA_DADOS = 'Cadastro Indicadores';
const ABA_REFERENCIA = 'Referência';

const COLUNAS_DADOS = [
  'periodo_referencia',
  'codigo_indicador',
  'tipo_atendimento',
  'detalhamento',
  'resultado_informado',
  'numerador',
  'denominador',
  'justificativa_observacao',
  'relatorio_fonte',
  'data_do_registro',
  'area_responsavel',
  'situacao_do_dado',
];

// Células com fórmula vêm como { formula, result }. Aqui devolvemos só o valor.
function lerValor(cell: Cell): unknown {
  const v: any = cell.value;
  if (v === null || v === undefined) return null;
  if (typeof v === 'object' && !(v instanceof Date)) {
    if ('result' in v) return v.result ?? null;
    if ('richText' in v) return v.richText.map((t: any) => t.text).join('');
    if ('text' in v) return v.text;
  }
  return v;
}

function texto(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

// null = vazio, NaN = valor que não é número
function numero(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v;
  const n = Number(String(v).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

// Dia 0 da planilha Excel (sistema 1900): 1899-12-30, em dias desde a época Unix.
const EPOCA_EXCEL_EM_DIAS = 25569;
const EPOCA_EXCEL_1904_EM_DIAS = 25569 - 1462;
const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;

// Aceita o Date já reconhecido pelo exceljs e, como reforço, o número de série do Excel cru:
// algumas planilhas (em especial exportadas por LibreOffice/Calc com formato de data
// personalizado) chegam com a célula formatada como número comum, e o exceljs não consegue
// convertê-la para Date sozinho — sem esse reforço a linha vira uma data errada (vazia ou de 1970).
function dataIso(v: unknown, date1904 = false): string | null {
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    const epoca = date1904 ? EPOCA_EXCEL_1904_EM_DIAS : EPOCA_EXCEL_EM_DIAS;
    const data = new Date(Math.round((v - epoca) * UM_DIA_EM_MS));
    if (Number.isNaN(data.getTime())) return null;
    return data.toISOString().slice(0, 10);
  }
  if (typeof v === 'string') {
    // dd/mm/aaaa (padrão br) — nunca usar o Date nativo aqui, que interpreta como mm/dd/aaaa.
    const brasileiro = v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brasileiro) {
      const [, d, m, a] = brasileiro;
      const data = new Date(Date.UTC(Number(a), Number(m) - 1, Number(d)));
      if (data.getUTCMonth() === Number(m) - 1 && data.getUTCDate() === Number(d)) {
        return data.toISOString().slice(0, 10);
      }
      return null;
    }
    // aaaa-mm-dd (ISO)
    const iso = v.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return iso[0];
  }
  return null;
}

// Procura a linha de cabeçalho (nas 10 primeiras) e devolve onde cada coluna está.
function mapearColunas(ws: Worksheet, colunaChave: string) {
  for (let r = 1; r <= 10; r++) {
    const colunas: Record<string, number> = {};
    ws.getRow(r).eachCell((cell, n) => {
      const nome = texto(lerValor(cell));
      if (nome) colunas[nome] = n;
    });
    if (colunas[colunaChave]) return { linhaCabecalho: r, colunas };
  }
  throw new PlanilhaInvalidaError(
    `Cabeçalho não encontrado na aba "${ws.name}" (coluna ${colunaChave}).`,
  );
}

function lerUnidades(ws: Worksheet): Map<string, string | null> {
  const { linhaCabecalho, colunas } = mapearColunas(ws, 'codigo_indicador');
  if (!colunas['unidade_medida']) {
    throw new PlanilhaInvalidaError(
      `Coluna unidade_medida não encontrada na aba "${ws.name}".`,
    );
  }
  const unidades = new Map<string, string | null>();
  for (let r = linhaCabecalho + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const codigo = texto(lerValor(row.getCell(colunas['codigo_indicador'])));
    if (codigo) {
      unidades.set(codigo, texto(lerValor(row.getCell(colunas['unidade_medida']))));
    }
  }
  return unidades;
}

export function lerPlanilha(wb: Workbook, agora: string): ResultadoLeitura {
  const dados = wb.getWorksheet(ABA_DADOS);
  const referencia = wb.getWorksheet(ABA_REFERENCIA);
  if (!dados || !referencia) {
    throw new PlanilhaInvalidaError(
      `O arquivo precisa ter as abas "${ABA_DADOS}" e "${ABA_REFERENCIA}".`,
    );
  }

  const date1904 = wb.properties?.date1904 ?? false;
  const unidades = lerUnidades(referencia);
  const { linhaCabecalho, colunas } = mapearColunas(dados, 'periodo_referencia');

  const faltando = COLUNAS_DADOS.filter((c) => !colunas[c]);
  if (faltando.length) {
    throw new PlanilhaInvalidaError(`Colunas ausentes: ${faltando.join(', ')}.`);
  }

  const linhas: LinhaResultado[] = [];
  const erros: ErroLinha[] = [];
  const vistas = new Map<string, number>();
  let ignoradas = 0;

  for (let r = linhaCabecalho + 1; r <= dados.rowCount; r++) {
    const row = dados.getRow(r);
    const v = (nome: string) => lerValor(row.getCell(colunas[nome]));
    const erro = (motivo: string) => erros.push({ linha: r, motivo });

    const codigo = texto(v('codigo_indicador'));
    const tipo = texto(v('tipo_atendimento'));
    const detalhamento = texto(v('detalhamento'));
    const periodo = v('periodo_referencia');
    const informado = numero(v('resultado_informado'));
    const numerador = numero(v('numerador'));
    const denominador = numero(v('denominador'));

    // linha sem nenhum campo de entrada manual: vazia ou só com fórmulas
    const semEntrada =
      !tipo && !detalhamento && !periodo &&
      informado === null && numerador === null && denominador === null;
    if (semEntrada) {
      if (codigo) ignoradas++;
      continue;
    }

    if (!codigo) { erro('codigo_indicador vazio'); continue; }
    if (!unidades.has(codigo)) { erro(`código ${codigo} não existe na aba Referência`); continue; }
    const periodoIso = dataIso(periodo, date1904);
    if (!periodoIso) { erro('periodo_referencia vazio ou não é uma data'); continue; }
    if (!tipo) { erro('tipo_atendimento vazio'); continue; }
    if (!detalhamento) { erro('detalhamento vazio'); continue; }

    if ([informado, numerador, denominador].some((n) => Number.isNaN(n))) {
      erro('resultado, numerador ou denominador não é número');
      continue;
    }

    // resultado: usa o informado; se não houver, calcula numerador / denominador
    let resultado: number | null = informado;
    if (resultado === null && numerador !== null && denominador !== null && denominador !== 0) {
      resultado = numerador / denominador;
    }
    if (resultado === null) {
      erro('sem resultado (preencha resultado_informado ou numerador e denominador)');
      continue;
    }

    // sempre o dia 1 do mês, para a chave única não duplicar por causa do dia
    const mes = periodoIso.slice(0, 7) + '-01';

    const chave = [mes, codigo, tipo, detalhamento].join('|');
    const anterior = vistas.get(chave);
    if (anterior) { erro(`linha repetida (mesma chave da linha ${anterior})`); continue; }
    vistas.set(chave, r);

    linhas.push({
      periodo_referencia: mes,
      codigo_indicador: codigo,
      tipo_atendimento: tipo,
      detalhamento,
      resultado,
      numerador,
      denominador,
      unidade_medida: unidades.get(codigo) ?? null,
      justificativa: texto(v('justificativa_observacao')),
      relatorio_fonte: texto(v('relatorio_fonte')),
      data_registro: dataIso(v('data_do_registro'), date1904),
      area_responsavel: texto(v('area_responsavel')),
      situacao_dado: texto(v('situacao_do_dado')),
      atualizado_em: agora,
    });
  }

  return { linhas, erros, ignoradas };
}