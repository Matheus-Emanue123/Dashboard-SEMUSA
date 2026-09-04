import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import SectionHeading from "../Dashboard/SectionHeading";
import IndicatorBrowser from "../../components/IndicatorBrowser/IndicatorBrowser";
import { CONEXAO_GROUPS, CONEXAO_HISTORY, CONEXAO_KPIS } from "../../services/linePages";
import { CONEXAO_INDICATORS } from "../../services/indicators";
import { LINE_CONEXAO } from "../../services/indicatorStages";

function ConexaoColaborativa({ onOpenSheet }) {
  const [stage, setStage] = useState("all");

  return (
    <div className="line-page">
      <article className="dashboard-panel">
        <SectionHeading
          title="Projeto Conexão Colaborativa"
          subtitle="Integração entre atenção primária, programas sociais e vigilância nutricional — 3 indicadores"
        />
        <div className="kpi-grid">
          {CONEXAO_KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="kpi-card"
              style={{ borderColor: `${kpi.color}30`, backgroundColor: `${kpi.color}10` }}
            >
              <span className="kpi-card__icon" style={{ backgroundColor: kpi.color }}>
                {kpi.icon}
              </span>
              <strong style={{ color: kpi.color }}>{kpi.value}</strong>
              <p>{kpi.label}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="line-page__row line-page__row--2">
        <article className="dashboard-panel">
          <SectionHeading title="Cobertura por grupo prioritário (%)" subtitle="Condicionalidades de saúde · Jan/2025" />
          <div className="chart-box chart-box--tall">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CONEXAO_GROUPS} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
                <XAxis dataKey="grupo" tick={{ fontSize: 9, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="cobertura" name="Cobertura" fill="#d97706" radius={[3, 3, 0, 0]} />
                <Bar dataKey="meta" name="Meta" fill="#d97706" fillOpacity={0.2} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel">
          <SectionHeading title="Histórico — cobertura PBF e SISVAN (%)" subtitle="Ago 2024 – Jan 2025" />
          <div className="chart-box chart-box--tall">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={CONEXAO_HISTORY} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="pbf" name="Bolsa Família" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="sisvan" name="SISVAN" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <IndicatorBrowser
        line={LINE_CONEXAO}
        indicators={CONEXAO_INDICATORS}
        stage={stage}
        onStageChange={setStage}
        onOpen={onOpenSheet}
        allGroupsLabel="Todos os programas"
        hint="Separe Bolsa Família e SISVAN. Cada linha abre a ficha técnica."
      />
    </div>
  );
}

export default ConexaoColaborativa;
