import { LinhaResultado } from './planilha.parser';

interface ConfigIndicador {
  id: string;
  unit: string;
  scale: number;
  // 'viep': coletado do Power BI da Vigilância Epidemiológica (tipo_atendimento 'Geral').
  origem?: 'viep';
  // 'soma': contagem absoluta (soma dos numeradores) em vez de razão ponderada.
  agregacao?: 'soma';
  // 'anual': a fonte só publica um valor por ano (gravado em janeiro).
  periodicidade?: 'anual';
  // Código IEPS_* equivalente: alimenta a série anual de Divinópolis e as linhas de MG e Brasil.
  ieps?: string;
}

// Contrato canônico da planilha e dos códigos VIEP. Nunca inferir IDs por nome do indicador.
// VIEP_PARTOS_NORMAIS/CESAREOS ficam só no banco por enquanto: mi08 já vem da planilha (PARTOS).
export const MAPEAMENTO_MATERNO: Record<string, ConfigIndicador> = {
  '2017': { id: 'mi37', unit: '%', scale: 100 },
  '2097': { id: 'mi38', unit: 'dias', scale: 1 },
  '2103': { id: 'mi35', unit: '%', scale: 100 },
  '2015': { id: 'mi34', unit: '%', scale: 100 },
  '2014': { id: 'mi36', unit: '%', scale: 100 },
  PORTA_MEDICO: { id: 'mi32', unit: 'minutos', scale: 1 },
  PA_PREPARTO: { id: 'mi33', unit: 'minutos', scale: 1 },
  ICSAP: { id: 'mi12', unit: '%', scale: 100, ieps: 'IEPS_ICSAP' },
  PARTOS: { id: 'mi08', unit: '%', scale: 100 },
  VIEP_SIFILIS_GESTANTE: { id: 'mi02', unit: 'por 1.000 NV', scale: 1000, origem: 'viep' },
  VIEP_SIFILIS_CONGENITA: { id: 'mi03', unit: 'por 1.000 NV', scale: 1000, origem: 'viep' },
  VIEP_AIDS_MENOR_1_ANO: { id: 'mi04', unit: 'casos', scale: 1, origem: 'viep', agregacao: 'soma' },
  VIEP_MORTALIDADE_INFANTIL: { id: 'mi05', unit: 'por 1.000 NV', scale: 1000, origem: 'viep', ieps: 'IEPS_MORTALIDADE_INFANTIL' },
  VIEP_MORTALIDADE_MATERNA: { id: 'mi06', unit: 'por 100 mil NV', scale: 100000, origem: 'viep', periodicidade: 'anual' },
  VIEP_GRAVIDEZ_ADOLESCENCIA: { id: 'mi07', unit: '%', scale: 100, origem: 'viep' },
  VIEP_BAIXO_PESO: { id: 'mi09', unit: '%', scale: 100, origem: 'viep', ieps: 'IEPS_BAIXO_PESO' },
  VIEP_PREMATURIDADE: { id: 'mi10', unit: '%', scale: 100, origem: 'viep', ieps: 'IEPS_PREMATURIDADE' },
  VIEP_7_CONSULTAS_PRENATAL: { id: 'mi13', unit: '%', scale: 100, origem: 'viep', ieps: 'IEPS_7_CONSULTAS_PRENATAL' },
  VIEP_PRENATAL_ATE_12_SEMANAS: { id: 'mi31', unit: '%', scale: 100, origem: 'viep', ieps: 'IEPS_PRENATAL_1_TRIMESTRE' },
};

// Códigos a buscar no banco: os do dashboard e os IEPS_* usados no comparativo.
export const CODIGOS_RESULTADOS = [...Object.keys(MAPEAMENTO_MATERNO),
  ...Object.values(MAPEAMENTO_MATERNO).flatMap(c => c.ieps ? [c.ieps] : [])];

// Locais gravados pelo módulo ieps-data no detalhamento.
const IEPS_MUNICIPIO = 'Divinópolis';
const IEPS_ESTADO = 'Minas Gerais';
const IEPS_PAIS = 'Brasil';
const FONTE_IEPS = 'IEPS Data';

type Row = Pick<LinhaResultado, 'periodo_referencia' | 'codigo_indicador' | 'tipo_atendimento' | 'detalhamento' | 'numerador' | 'denominador' | 'resultado' | 'relatorio_fonte' | 'atualizado_em'>;

// São estratos mutuamente exclusivos no modelo importado. Totais, subconjuntos
// e categorias desconhecidas não participam da consolidação.
const CATEGORIAS_PARTOS = [
  ['SUS', 'Parto normal - alto risco', 'normal'],
  ['SUS', 'Parto normal - risco habitual', 'normal'],
  ['Saúde suplementar', 'Parto normal - sem estratificação de risco', 'normal'],
  ['SUS', 'Parto cesáreo - alto risco', 'cesareo'],
  ['SUS', 'Parto cesáreo - risco habitual', 'cesareo'],
  ['Saúde suplementar', 'Parto cesáreo - sem estratificação de risco', 'cesareo'],
] as const;

function selecionar(codigo: string, rows: Row[]) {
  if (MAPEAMENTO_MATERNO[codigo].origem === 'viep') {
    return rows.filter(r => r.tipo_atendimento === 'Geral' && r.detalhamento === 'Sem detalhamento');
  }
  if (codigo === 'PARTOS') return rows.filter(r => CATEGORIAS_PARTOS.some(([tipo, detalhe]) => tipo === r.tipo_atendimento && detalhe === r.detalhamento));
  if (codigo === 'PORTA_MEDICO' || codigo === 'PA_PREPARTO') {
    return rows.filter(r => r.tipo_atendimento === 'Geral' && r.detalhamento === 'Todas as classificações');
  }
  const tipos = codigo === 'ICSAP' ? ['Geral'] : ['SUS', 'Saúde suplementar'];
  return rows.filter(r => tipos.includes(r.tipo_atendimento) && r.detalhamento === 'Sem detalhamento');
}

function agregar(codigo: string, rows: Row[], scale: number) {
  if (!rows.length) return { value: null, normal: null, cesareo: null };
  if (codigo === 'PARTOS') {
    // Sem todas as categorias de um mês, não transformar ausência em zero.
    const meses = new Set(rows.map(r => r.periodo_referencia));
    const completo = [...meses].every(mes => CATEGORIAS_PARTOS.every(([tipo, detalhe]) => rows.some(r => r.periodo_referencia === mes && r.tipo_atendimento === tipo && r.detalhamento === detalhe)));
    if (!completo || rows.some(r => !Number.isFinite(r.resultado) || r.resultado < 0)) return { value: null, normal: null, cesareo: null };
    let normal = 0, cesareo = 0;
    for (const row of rows) {
      const categoria = CATEGORIAS_PARTOS.find(([tipo, detalhe]) => tipo === row.tipo_atendimento && detalhe === row.detalhamento)!;
      if (categoria[2] === 'normal') normal += row.resultado;
      else cesareo += row.resultado;
    }
    const total = normal + cesareo;
    return { value: null, normal: total ? normal / total * 100 : null, cesareo: total ? cesareo / total * 100 : null };
  }
  if (MAPEAMENTO_MATERNO[codigo].agregacao === 'soma') {
    if (rows.some(r => !Number.isFinite(r.numerador) || r.numerador! < 0)) return { value: null, normal: null, cesareo: null };
    return { value: rows.reduce((s, r) => s + r.numerador!, 0), normal: null, cesareo: null };
  }
  // Nunca substituir componentes ausentes por zero nem usar média de resultados.
  if (rows.some(r => !Number.isFinite(r.numerador) || !Number.isFinite(r.denominador) || r.denominador! < 0 || (r.denominador === 0 && r.numerador !== 0))) return { value: null, normal: null, cesareo: null };
  const numerator = rows.reduce((s, r) => s + r.numerador!, 0);
  const denominator = rows.reduce((s, r) => s + r.denominador!, 0);
  return { value: denominator > 0 ? numerator / denominator * scale : null, normal: null, cesareo: null };
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' });
const monthName = (year: number, month: number) => monthFormatter.format(new Date(Date.UTC(year, month - 1, 1))).replace('.', '');

// Valor anual publicado pelo IEPS para um local, na escala do indicador. Ano → valor.
function anuaisIeps(rows: Row[], local: string, scale: number) {
  const valores = new Map<string, number>();
  for (const r of rows) {
    if (r.detalhamento !== local || !Number.isFinite(r.numerador) || !Number.isFinite(r.denominador) || !r.denominador) continue;
    valores.set(r.periodo_referencia.slice(0, 4), r.numerador! / r.denominador! * scale);
  }
  return valores;
}

// Série anual de Divinópolis. Ano publicado pelo IEPS usa o valor do IEPS (mesma metodologia de
// MG e Brasil, ano fechado); os demais anos consolidam os nossos dados. Ano incompleto ou
// corrente é parcial.
function serieAnual(codigo: string, config: ConfigIndicador, selected: Row[], ieps: Row[]) {
  const anoAtual = new Date().getUTCFullYear();
  const doIeps = anuaisIeps(ieps, IEPS_MUNICIPIO, config.scale);
  const anos = [...new Set([...selected.map(r => r.periodo_referencia.slice(0, 4)), ...doIeps.keys()])].sort();
  return anos.map(ano => {
    if (doIeps.has(ano)) {
      return { period: ano, label: ano, partial: false, source: FONTE_IEPS, value: doIeps.get(ano)!, normal: null, cesareo: null };
    }
    const doAno = selected.filter(r => r.periodo_referencia.startsWith(ano));
    const meses = new Set(doAno.map(r => r.periodo_referencia.slice(0, 7))).size;
    const partial = Number(ano) >= anoAtual || (config.periodicidade !== 'anual' && meses < 12);
    return { period: ano, label: `${ano}${partial ? ' · parcial' : ''}`, partial, source: null, ...agregar(codigo, doAno, config.scale) };
  });
}

// Linhas de MG e Brasil (IEPS Data), anuais. null quando o indicador não tem equivalente.
function comparativo(config: ConfigIndicador, ieps: Row[]) {
  if (!config.ieps) return null;
  const serie = (local: string) => [...anuaisIeps(ieps, local, config.scale)].sort(([a], [b]) => a.localeCompare(b))
    .map(([period, value]) => ({ period, label: period, value }));
  const state = serie(IEPS_ESTADO);
  const country = serie(IEPS_PAIS);
  if (!state.length && !country.length) return null;
  return { source: FONTE_IEPS, state, country };
}

// Fonte com um valor por ano: série anual, sem quadrimestres. O ano corrente é parcial.
function resultadoAnual(codigo: string, config: ConfigIndicador, selected: Row[], ieps: Row[]) {
  const annual = serieAnual(codigo, config, selected, ieps);
  const local = annual.filter(a => a.source === null);
  return { id: config.id, code: codigo, unit: config.unit, latest: local.slice(-1)[0] ?? null,
    monthly: local, quadrimester: [], annual, comparison: comparativo(config, ieps),
    sources: [...new Set(selected.map(r => r.relatorio_fonte).filter(Boolean))],
    updatedAt: selected.map(r => r.atualizado_em).sort().slice(-1)[0] ?? null,
    frequency: 'Anual', parameter: null, status: 'unevaluated', trend: null };
}

export function construirResultados(rows: Row[]) {
  return { indicators: Object.entries(MAPEAMENTO_MATERNO).map(([codigo, config]) => {
    const imported = rows.filter(r => r.codigo_indicador === codigo);
    const selected = selecionar(codigo, imported);
    const ieps = config.ieps ? rows.filter(r => r.codigo_indicador === config.ieps && r.tipo_atendimento === 'Geral') : [];
    if (config.periodicidade === 'anual') return resultadoAnual(codigo, config, selected, ieps);
    // Preservar também meses sem resumo calculável; não ressuscitar um valor antigo.
    const months = [...new Set(imported.map(r => r.periodo_referencia.slice(0, 7)))].sort();
    const monthly = months.map(month => {
      const [year, number] = month.split('-').map(Number);
      return { period: month, label: `${monthName(year, number)}/${year}`, partial: false,
        ...agregar(codigo, selected.filter(r => r.periodo_referencia.startsWith(month)), config.scale) };
    });
    const periods = [...new Set(months.map(month => {
      const [year, number] = month.split('-');
      return `${year}-${String(Math.floor((Number(number) - 1) / 4) * 4 + 1).padStart(2, '0')}`;
    }))];
    const quadrimester = periods.map(period => {
      const [year, start] = period.split('-').map(Number);
      const included = months.filter(month => month.slice(0, 4) === String(year) && Number(month.slice(5)) >= start && Number(month.slice(5)) < start + 4);
      const partial = included.length < 4;
      const validMonths = included.every(month => selected.some(r => r.periodo_referencia.startsWith(month)));
      return { period, label: `${monthName(year, start)}–${monthName(year, start + 3)}/${year}${partial ? ' · parcial' : ''}`, partial,
        ...agregar(codigo, validMonths ? selected.filter(r => included.includes(r.periodo_referencia.slice(0, 7))) : [], config.scale) };
    });
    return { id: config.id, code: codigo, unit: config.unit, latest: monthly.slice(-1)[0] ?? null,
      monthly, quadrimester, annual: serieAnual(codigo, config, selected, ieps), comparison: comparativo(config, ieps), sources: [...new Set(selected.map(r => r.relatorio_fonte).filter(Boolean))],
      updatedAt: selected.map(r => r.atualizado_em).sort().slice(-1)[0] ?? null,
      frequency: 'Mensal', parameter: null, status: 'unevaluated', trend: null };
  }) };
}
