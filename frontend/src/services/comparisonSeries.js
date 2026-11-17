// Linhas comparativas de MG e Brasil (IEPS Data) sobre a série de Divinópolis do gráfico.
// O IEPS só publica valores anuais:
// - na visão anual, cada ano recebe o valor de MG e do Brasil daquele ano;
// - na mensal/quadrimestral, entram como referência fixa com o último ano publicado,
//   porque os nossos dados mensais são de anos que o IEPS ainda não cobre.
export const COMPARISON_LINES = [
  { key: "state", name: "Minas Gerais" },
  { key: "country", name: "Brasil" },
];

// Anos sem dado viram buracos explícitos no eixo, para a linha não ligar 2024 direto a 2026.
export function fillMissingYears(data) {
  const years = data.map((item) => Number(item.period)).filter(Number.isInteger);
  if (!years.length) return data;
  const byYear = new Map(data.map((item) => [item.period, item]));
  const filled = [];
  for (let year = Math.min(...years); year <= Math.max(...years); year++) {
    const period = String(year);
    filled.push(byYear.get(period) ?? { period, label: period, partial: false, value: null });
  }
  return filled;
}

const latest = (series) => series?.length ? series[series.length - 1] : null;

export function buildComparisonData(data, comparison, granularity) {
  if (!comparison) return { data: granularity === "annual" ? fillMissingYears(data) : data, lines: [] };

  if (granularity === "annual") {
    const rows = new Map(data.map((item) => [item.period, { ...item }]));
    for (const { key } of COMPARISON_LINES) {
      for (const point of comparison[key] ?? []) {
        const row = rows.get(point.period) ?? { period: point.period, label: point.label, partial: false, value: null };
        row[key] = point.value;
        rows.set(point.period, row);
      }
    }
    const lines = COMPARISON_LINES.filter(({ key }) => comparison[key]?.length).map((line) => ({ ...line, reference: null }));
    return { data: fillMissingYears([...rows.values()]), lines };
  }

  const lines = COMPARISON_LINES
    .map((line) => ({ ...line, reference: latest(comparison[line.key]) }))
    .filter((line) => line.reference);
  if (!data.length) return { data, lines: [] };
  return {
    data: data.map((item) => ({ ...item, ...Object.fromEntries(lines.map((line) => [line.key, line.reference.value])) })),
    lines,
  };
}
