import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { CATALOG_INDICATORS } from "../../services/catalogIndicators";
import { INDICATOR_HISTORY, buildIndicatorSeries, formatIndicatorValue } from "../../services/indicatorHistory";
import { buildComparisonData } from "../../services/comparisonSeries";
import { useMaternoResults } from "../../hooks/useMaternoResults";
import SectionHeading from "./SectionHeading";

const GRANULARITIES = [
  { id: "quadrimester", label: "Quadrimestral" },
  { id: "monthly", label: "Mensal" },
  { id: "annual", label: "Anual", maternoOnly: true },
];

const PERIOD_NOTES = {
  quadrimester: "quadrimestres (jan–abr, mai–ago, set–dez)",
  monthly: "meses",
  annual: "anos",
};

const LEGEND_ORDER = ["value", "state", "country"];
const MAIN_COLOR = "#1d8fa8";
const COMPARISON_STYLE = {
  state: { stroke: "#d9822b", strokeDasharray: "6 4" },
  country: { stroke: "#7b61c9", strokeDasharray: "2 4" },
};

function CoverageChart({ maternoOnly = false }) {
  const { indicators: maternoIndicators, error, loading } = useMaternoResults();
  const [selectedGranularity, setGranularity] = useState("quadrimester");
  const [compare, setCompare] = useState(false);
  const [indicatorId, setIndicatorId] = useState(maternoOnly ? "mi37" : INDICATOR_HISTORY[0]?.indicatorId ?? "");
  const availableIndicators = maternoOnly ? maternoIndicators : CATALOG_INDICATORS.map(item => item.line === "Materno-Infantil" ? maternoIndicators.find(real => real.id === item.id) : item);
  const indicator = availableIndicators.find((item) => item.id === indicatorId);
  const isMaterno = indicator?.line === "Materno-Infantil";
  const granularities = GRANULARITIES.filter((option) => isMaterno || !option.maternoOnly);
  // A visão anual só existe para os resultados importados; nos demais volta ao quadrimestral.
  const granularity = granularities.some((option) => option.id === selectedGranularity) ? selectedGranularity : "quadrimester";
  const series = isMaterno ? null : INDICATOR_HISTORY.find((item) => item.indicatorId === indicatorId);
  const baseData = useMemo(() => isMaterno ? indicator?.history?.[granularity] ?? [] : buildIndicatorSeries(series, granularity), [isMaterno, indicator, series, granularity]);
  const comparison = isMaterno ? indicator?.comparison ?? null : null;
  const comparing = compare && Boolean(comparison);
  const { data, lines: comparisonLines } = useMemo(
    () => buildComparisonData(baseData, comparing ? comparison : null, granularity),
    [baseData, comparing, comparison, granularity],
  );
  const births = indicatorId === "mi08";
  const hasData = data.some(item => births ? item.normal != null || item.cesareo != null : item.value != null || comparisonLines.some(line => item[line.key] != null));
  const unit = indicator?.historyUnit ?? indicator?.unit;
  const lineName = (line) => line.reference ? `${line.name} (${line.reference.label})` : line.name;

  return (
    <article className="dashboard-panel">
      <div className="evolution-chart__header">
        <SectionHeading
          title="Evolução do indicador"
          subtitle={isMaterno ? "Resultados importados · consolidação pelos componentes" : "Série mensal demonstrativa consolidada por quadrimestre"}
        />
        <div className="evolution-chart__controls">
          <label className="evolution-chart__indicator-label" htmlFor={maternoOnly ? "materno-evolution-indicator" : "evolution-indicator"}>
            Indicador
          </label>
          <select
            id={maternoOnly ? "materno-evolution-indicator" : "evolution-indicator"}
            className="evolution-chart__indicator"
            value={indicatorId}
            onChange={(event) => setIndicatorId(event.target.value)}
          >
            {availableIndicators.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <div className="evolution-chart__granularity" role="group" aria-label="Granularidade do período">
            {granularities.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`evolution-chart__granularity-button ${granularity === option.id ? "is-active" : ""}`}
                aria-pressed={granularity === option.id}
                onClick={() => setGranularity(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {comparison && (
            <label className="evolution-chart__compare">
              <input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} />
              Comparar com Minas Gerais e Brasil
            </label>
          )}
        </div>
      </div>

      <p className="evolution-chart__period-note" aria-live="polite">
        Exibindo {PERIOD_NOTES[granularity]}
        {unit ? ` · Unidade: ${unit}` : ""}
      </p>
      {comparing && (
        <p className="evolution-chart__period-note">
          {granularity === "annual"
            ? `Minas Gerais e Brasil: ${comparison.source} (anual). Anos fechados de Divinópolis também vêm do ${comparison.source}, para comparar pela mesma metodologia.`
            : `Minas Gerais e Brasil: último ano publicado pelo ${comparison.source}, como referência. Use a visão Anual para comparar ano a ano.`}
        </p>
      )}

      {births && <p>Partos normais (azul claro) · Partos cesáreos (azul escuro)</p>}
      {isMaterno && loading && <p role="status">Carregando histórico...</p>}
      {isMaterno && error && <p role="alert">{error}</p>}
      {hasData ? (
        <div className="coverage-chart">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
              <YAxis width={52} tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
              <Tooltip
                labelFormatter={(label, payload) => payload?.[0]?.payload?.partial ? `${label} (período parcial)` : label}
                formatter={(value, name, item) => [
                  formatIndicatorValue(value, unit),
                  item?.dataKey === "value" && item?.payload?.source ? `${name} (${item.payload.source})` : name,
                ]}
                contentStyle={{ border: "1px solid #d0dcea", borderRadius: 8, fontSize: 12 }}
              />
              {births ? <>
                <Line type="monotone" dataKey="normal" name="Partos normais" stroke="#1d8fa8" dot={{ r: 4 }} connectNulls={false} />
                <Line type="monotone" dataKey="cesareo" name="Partos cesáreos" stroke="#1d4e8a" dot={{ r: 4 }} connectNulls={false} />
              </> : <Line
                type="monotone"
                dataKey="value"
                name={comparing ? "Divinópolis" : indicator?.name ?? "Indicador"}
                stroke={MAIN_COLOR}
                strokeWidth={2.5}
                dot={{ r: 4, fill: MAIN_COLOR }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />}
              {!births && comparisonLines.map((line) => (
                <Line
                  key={line.key}
                  type={line.reference ? "linear" : "monotone"}
                  dataKey={line.key}
                  name={lineName(line)}
                  {...COMPARISON_STYLE[line.key]}
                  strokeWidth={2}
                  dot={line.reference ? false : { r: 3, fill: COMPARISON_STYLE[line.key].stroke }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
              {comparing && !births && <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" itemSorter={(item) => LEGEND_ORDER.indexOf(item.dataKey)} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="evolution-chart__empty" role="status">
          Não há série histórica disponível para este indicador neste período.
        </p>
      )}
    </article>
  );
}

export default CoverageChart;
