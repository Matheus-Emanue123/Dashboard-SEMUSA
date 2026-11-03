import { LinhaResultado } from './planilha.parser';

// Contrato canônico da planilha. Nunca inferir IDs por nome do indicador.
export const MAPEAMENTO_MATERNO = {
  '2017': { id: 'mi37', unit: '%', scale: 100 },
  '2097': { id: 'mi38', unit: 'dias', scale: 1 },
  '2103': { id: 'mi35', unit: '%', scale: 100 },
  '2015': { id: 'mi34', unit: '%', scale: 100 },
  '2014': { id: 'mi36', unit: '%', scale: 100 },
  PORTA_MEDICO: { id: 'mi32', unit: 'minutos', scale: 1 },
  PA_PREPARTO: { id: 'mi33', unit: 'minutos', scale: 1 },
  ICSAP: { id: 'mi12', unit: '%', scale: 100 },
  PARTOS: { id: 'mi08', unit: '%', scale: 100 },
} as const;

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
  // Nunca substituir componentes ausentes por zero nem usar média de resultados.
  if (rows.some(r => !Number.isFinite(r.numerador) || !Number.isFinite(r.denominador) || r.denominador! < 0 || (r.denominador === 0 && r.numerador !== 0))) return { value: null, normal: null, cesareo: null };
  const numerator = rows.reduce((s, r) => s + r.numerador!, 0);
  const denominator = rows.reduce((s, r) => s + r.denominador!, 0);
  return { value: denominator > 0 ? numerator / denominator * scale : null, normal: null, cesareo: null };
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' });
const monthName = (year: number, month: number) => monthFormatter.format(new Date(Date.UTC(year, month - 1, 1))).replace('.', '');

export function construirResultados(rows: Row[]) {
  return { indicators: Object.entries(MAPEAMENTO_MATERNO).map(([codigo, config]) => {
    const imported = rows.filter(r => r.codigo_indicador === codigo);
    const selected = selecionar(codigo, imported);
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
      monthly, quadrimester, sources: [...new Set(selected.map(r => r.relatorio_fonte).filter(Boolean))],
      updatedAt: selected.map(r => r.atualizado_em).sort().slice(-1)[0] ?? null,
      parameter: null, status: 'unevaluated', trend: null };
  }) };
}
