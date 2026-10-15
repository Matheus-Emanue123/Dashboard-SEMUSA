import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { CATALOG_INDICATORS } from "../../services/catalogIndicators";
import { INDICATOR_HISTORY, buildIndicatorSeries, formatIndicatorValue } from "../../services/indicatorHistory";
import SectionHeading from "./SectionHeading";

const GRANULARITIES = [
  { id: "quadrimester", label: "Quadrimestral" },
  { id: "monthly", label: "Mensal" },
];

function CoverageChart() {
  const [granularity, setGranularity] = useState("quadrimester");
  const [indicatorId, setIndicatorId] = useState(INDICATOR_HISTORY[0]?.indicatorId ?? "");
  const availableIndicators = CATALOG_INDICATORS;
  const indicator = availableIndicators.find((item) => item.id === indicatorId);
  const series = INDICATOR_HISTORY.find((item) => item.indicatorId === indicatorId);
  const data = useMemo(() => buildIndicatorSeries(series, granularity), [series, granularity]);

  return (
    <article className="dashboard-panel">
      <div className="evolution-chart__header">
        <SectionHeading
          title="Evolução do indicador"
          subtitle="Série mensal demonstrativa consolidada por quadrimestre"
        />
        <div className="evolution-chart__controls">
          <label className="evolution-chart__indicator-label" htmlFor="evolution-indicator">
            Indicador
          </label>
          <select
            id="evolution-indicator"
            className="evolution-chart__indicator"
            value={indicatorId}
            onChange={(event) => setIndicatorId(event.target.value)}
          >
            {availableIndicators.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <div className="evolution-chart__granularity" role="group" aria-label="Granularidade do período">
            {GRANULARITIES.map((option) => (
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
        </div>
      </div>

      <p className="evolution-chart__period-note" aria-live="polite">
        Exibindo {granularity === "quadrimester" ? "quadrimestres (jan–abr, mai–ago, set–dez)" : "meses"}
        {indicator?.unit ? ` · Unidade: ${indicator.unit}` : ""}
      </p>

      {data.length ? (
        <div className="coverage-chart">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
              <YAxis width={52} tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
              <Tooltip
                labelFormatter={(label, payload) => payload?.[0]?.payload?.partial ? `${label} (período parcial)` : label}
                formatter={(value) => formatIndicatorValue(value, indicator?.unit)}
                contentStyle={{ border: "1px solid #d0dcea", borderRadius: 8, fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={indicator?.name ?? "Indicador"}
                stroke="#1d8fa8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#1d8fa8" }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
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
