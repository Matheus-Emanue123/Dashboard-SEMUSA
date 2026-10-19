import { formatIndicatorValue } from './indicatorHistory.js';

// IDs dos seis cards priorizados existentes, preservando sua identidade no catálogo.
export const MATERNO_PRIORITIZED_IDS = ['mi31', 'mi13', 'mi01', 'mi05', 'mi03', 'mi28'];

export function applyMaternoResults(catalog, response) {
  return catalog.map(indicator => {
    const result = response?.indicators?.find(item => item.id === indicator.id);
    const latest = result?.latest;
    const births = indicator.id === 'mi08';
    const value = births && latest && (latest.normal !== null || latest.cesareo !== null)
      ? `Normais: ${formatIndicatorValue(latest.normal, '%')} · Cesáreos: ${formatIndicatorValue(latest.cesareo, '%')}`
      : latest?.value != null ? formatIndicatorValue(latest.value, '') : '—';
    return {
      ...indicator,
      value,
      unit: value === '—' || births ? '' : result.unit,
      period: latest?.label ?? 'Sem dados',
      parameter: 'Não definido', parameterStatus: 'unevaluated', status: 'unevaluated', trend: '—',
      frequency: result ? 'Mensal' : indicator.frequency,
      source: result?.sources?.length ? result.sources.join('; ') : 'Sem fonte importada',
      limitations: 'Resumo limitado às categorias suportadas da planilha importada. Sem avaliação de meta ou tendência.',
      realData: true,
      updatedAt: result?.updatedAt ?? null,
      history: result ? { monthly: result.monthly, quadrimester: result.quadrimester } : { monthly: [], quadrimester: [] },
      historyUnit: result?.unit ?? indicator.unit,
    };
  });
}
