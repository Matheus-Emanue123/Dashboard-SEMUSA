// Monthly observations keyed by canonical indicator ID. Values are illustrative.
// Each series declares how its monthly components must be combined.
export const INDICATOR_HISTORY = [
  {
    indicatorId: "mi31",
    aggregation: { type: "ratio", scale: 100 },
    observations: [
      { month: "2024-10", numerator: 68, denominator: 100 },
      { month: "2024-11", numerator: 72, denominator: 100 },
      { month: "2024-12", numerator: 74, denominator: 100 },
      { month: "2025-01", numerator: 77, denominator: 100 },
      { month: "2025-02", numerator: 80, denominator: 100 },
    ],
  },
  {
    indicatorId: "nav2",
    aggregation: { type: "mean" },
    observations: [
      { month: "2024-08", total: 1200, count: 30 },
      { month: "2024-09", total: 1240, count: 31 },
      { month: "2024-10", total: 1290, count: 30 },
      { month: "2024-11", total: 1260, count: 30 },
      { month: "2024-12", total: 1395, count: 31 },
      { month: "2025-01", total: 1457, count: 31 },
    ],
  },
  {
    indicatorId: "mi04",
    aggregation: { type: "count" },
    observations: [
      { month: "2024-08", value: 3 },
      { month: "2024-09", value: 2 },
      { month: "2024-10", value: 4 },
      { month: "2024-11", value: 1 },
      { month: "2024-12", value: 3 },
      { month: "2025-01", value: 2 },
    ],
  },
  {
    indicatorId: "con2",
    aggregation: { type: "ratio", scale: 100 },
    observations: [
      { month: "2024-09", numerator: 36, denominator: 100 },
      { month: "2024-10", numerator: 38, denominator: 100 },
      { month: "2024-11", numerator: 43, denominator: 100 },
      { month: "2024-12", numerator: 42, denominator: 100 },
      { month: "2025-01", numerator: 44, denominator: 100 },
    ],
  },
];

const MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });

function parseMonth(month) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

function periodFor(month) {
  const parsed = parseMonth(month);
  if (!parsed) return null;
  const startMonth = Math.floor((parsed.month - 1) / 4) * 4 + 1;
  return {
    key: `${parsed.year}-${String(startMonth).padStart(2, "0")}`,
    year: parsed.year,
    startMonth,
    endMonth: startMonth + 3,
  };
}

function calculate(aggregation, observations) {
  if (!observations.length) return null;
  if (aggregation.type === "ratio") {
    const numerator = observations.reduce((sum, item) => sum + item.numerator, 0);
    const denominator = observations.reduce((sum, item) => sum + item.denominator, 0);
    return denominator === 0 ? null : (numerator / denominator) * aggregation.scale;
  }
  if (aggregation.type === "mean") {
    const total = observations.reduce((sum, item) => sum + item.total, 0);
    const count = observations.reduce((sum, item) => sum + item.count, 0);
    return count === 0 ? null : total / count;
  }
  if (aggregation.type === "count") {
    return observations.reduce((sum, item) => sum + item.value, 0);
  }
  return null;
}

function formatMonth(month) {
  const { year, month: monthNumber } = parseMonth(month);
  const label = MONTH_FORMATTER.format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  return `${label.replace(".", "")}/${year}`;
}

export function buildIndicatorSeries(series, granularity) {
  if (!series?.observations?.length) return [];

  if (granularity === "monthly") {
    return series.observations
      .filter((item) => parseMonth(item.month))
      .slice()
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        period: item.month,
        label: formatMonth(item.month),
        value: calculate(series.aggregation, [item]),
        partial: false,
      }));
  }

  const groups = new Map();
  for (const observation of series.observations) {
    const period = periodFor(observation.month);
    if (!period) continue;
    const group = groups.get(period.key) ?? { ...period, observations: [] };
    group.observations.push(observation);
    groups.set(period.key, group);
  }

  return [...groups.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((group) => {
      const months = new Set(group.observations.map((item) => parseMonth(item.month).month));
      const complete = months.size === 4;
      const start = new Date(Date.UTC(group.year, group.startMonth - 1, 1));
      const end = new Date(Date.UTC(group.year, group.endMonth - 1, 1));
      const startLabel = MONTH_FORMATTER.format(start).replace(".", "");
      const endLabel = MONTH_FORMATTER.format(end).replace(".", "");
      return {
        period: group.key,
        label: `${startLabel}–${endLabel}/${group.year}${complete ? "" : " · parcial"}`,
        value: calculate(series.aggregation, group.observations),
        partial: !complete,
      };
    });
}

export function formatIndicatorValue(value, unit) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Sem dados";
  const formatted = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
  return unit === "%" ? `${formatted}%` : unit ? `${formatted} ${unit}` : formatted;
}
