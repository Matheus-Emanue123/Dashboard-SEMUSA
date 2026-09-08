//OK
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
//import { COVERAGE_SERIES, COVERAGE_LINES } from "../../services/overviewDashboard";
import SectionHeading from "./SectionHeading";

function CoverageChart() {
  const [series, setSeries] = useState([]);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    apiGet("cobertura-mensal")
      .then(setSeries)
      .catch((err) => console.error("Erro ao carregar cobertura mensal:", err));
  }, []);

  useEffect(() => {
    apiGet("cobertura-linhas")
      .then(setLines)
      .catch((err) => console.error("Erro ao carregar cobertura por linha:", err));
  }, []);
  return (
    <article className="dashboard-panel">
      <SectionHeading
        title="Evolução recente — cobertura média por linha (%)"
        subtitle="Dados ilustrativos · Ago 2024 – Fev 2025"
      />

      <div className="coverage-chart">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={series} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <defs>
              {lines.map((line) => (
                <linearGradient key={line.gradientId} id={line.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ border: "1px solid #d0dcea", borderRadius: 8, fontSize: 12 }}
              formatter={(value) => `${value}%`}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            {lines.map((line) => (
              <Area
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                fill={`url(#${line.gradientId})`}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default CoverageChart;
