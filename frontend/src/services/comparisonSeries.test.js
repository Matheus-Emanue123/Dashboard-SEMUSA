import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildComparisonData } from './comparisonSeries.js';

const comparison = {
  source: 'IEPS Data',
  state: [{ period: '2023', label: '2023', value: 11.9 }, { period: '2024', label: '2024', value: 12.1 }],
  country: [{ period: '2024', label: '2024', value: 12.4 }],
};

test('sem comparativo, devolve a série original sem linhas extras', () => {
  const data = [{ period: '2026-01', value: 10 }];
  assert.deepEqual(buildComparisonData(data, null, 'monthly'), { data, lines: [] });
  assert.deepEqual(buildComparisonData([{ period: '2024', value: 1 }, { period: '2026', value: 2 }], null, 'annual').data.map((d) => [d.period, d.value]), [['2024', 1], ['2025', null], ['2026', 2]]);
});

test('anual: une os anos e põe MG e Brasil no ano de cada valor', () => {
  const { data, lines } = buildComparisonData([{ period: '2024', label: '2024', value: 12 }, { period: '2026', label: '2026 · parcial', partial: true, value: 10 }], comparison, 'annual');
  assert.deepEqual(data.map((d) => [d.period, d.value, d.state, d.country]), [
    ['2023', null, 11.9, undefined], ['2024', 12, 12.1, 12.4], ['2025', null, undefined, undefined], ['2026', 10, undefined, undefined],
  ]);
  assert.deepEqual(lines.map((l) => l.key), ['state', 'country']);
});

test('mensal/quadrimestral: último ano publicado vira referência fixa', () => {
  const { data, lines } = buildComparisonData([{ period: '2026-01', value: 9 }, { period: '2026-02', value: 11 }], comparison, 'monthly');
  assert.deepEqual(data.map((d) => [d.state, d.country]), [[12.1, 12.4], [12.1, 12.4]]);
  assert.deepEqual(lines.map((l) => [l.key, l.reference.period]), [['state', '2024'], ['country', '2024']]);
});

test('local sem dados (ex.: mortalidade infantil sem Brasil) não gera linha', () => {
  const { lines } = buildComparisonData([{ period: '2026-01', value: 9 }], { state: comparison.state, country: [] }, 'quadrimester');
  assert.deepEqual(lines.map((l) => l.key), ['state']);
});
