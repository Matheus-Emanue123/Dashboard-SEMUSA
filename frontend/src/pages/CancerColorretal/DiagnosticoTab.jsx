import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import SectionHeading from "../Dashboard/SectionHeading";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import IndicatorBrowser from "../../components/IndicatorBrowser/IndicatorBrowser";
import {
  DIAGNOSTICO_KPIS,
  DIAGNOSTICO_WAIT_TIMES,
  DIAGNOSTICO_PROVIDERS,
} from "../../services/linePages";
import { CANCER_FICHA_INDICATORS } from "../../services/catalogIndicators";
import { LINE_CANCER } from "../../services/indicatorStages";

import "./DiagnosticoTab.css";

const DIAGNOSTICO_STAGE = [
  { id: "DIAGNÓSTICO", label: "Diagnóstico", color: "#1d4e8a" },
];

function DiagnosticoTab({ onOpenSheet }) {
  // Mapeia os indicadores completos do catálogo para abrir a Ficha Técnica
  const diagnosticIndicators = useMemo(() => {
    const diagnosticIds = new Set(["cc03", "cc04", "cc05", "cc06"]);
    return CANCER_FICHA_INDICATORS.filter((ind) => diagnosticIds.has(ind.id));
  }, []);

  const handleOpenSheet = (id) => {
    if (!onOpenSheet) return;
    const found = diagnosticIndicators.find((ind) => ind.id === id);
    if (found) {
      onOpenSheet(found);
    }
  };

  return (
    <div className="diagnostico-tab" role="tabpanel" aria-label="Aba de Diagnóstico">
      {/* 1. Header explicativo da etapa */}
      <div className="diagnostico-header">
        <span className="diagnostico-badge">Etapa 3 · Diagnóstico e Investigação</span>
        <SectionHeading
          title="Investigação Diagnóstica e Regulação Especializada"
          subtitle="Monitoramento de colonoscopias, tempo de espera para laudo de biópsia e cumprimento da Lei Federal nº 13.896/2019 (meta ≤ 30 dias para exames diagnósticos no SUS)."
        />
      </div>

      {/* 2. Cards de KPIs principais */}
      <div className="diagnostico-kpi-grid">
        {DIAGNOSTICO_KPIS.map((kpi) => (
          <article key={kpi.id} className="diagnostico-kpi-card">
            <div>
              <div className="diagnostico-kpi-card__top">
                <span className="diagnostico-kpi-card__code">{kpi.id}</span>
                <StatusBadge status={kpi.status} />
              </div>
              <h3 className="diagnostico-kpi-card__title">{kpi.label}</h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                {kpi.description}
              </p>
            </div>

            <div>
              <div className="diagnostico-kpi-card__value-wrap">
                <span className="diagnostico-kpi-card__value">{kpi.value}</span>
                <span className={`diagnostico-kpi-card__trend ${kpi.status === "alert" ? "is-alert" : ""}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="diagnostico-kpi-card__meta">
                <span>{kpi.meta}</span>
                <button
                  type="button"
                  className="diagnostico-kpi-card__btn"
                  onClick={() => handleOpenSheet(kpi.id)}
                >
                  Ver Ficha →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 3. Dois gráficos principais da etapa */}
      <div className="line-page__row line-page__row--2">
        {/* Gráfico 1: Tempos Médios de Espera vs Metas Regulatórias */}
        <article className="dashboard-panel">
          <SectionHeading
            title="Evolução do Tempo de Espera (dias)"
            subtitle="Tempo até consulta especializada e laudo de biópsia histopatológica (Ago 2024 – Jan 2025)"
          />
          <div className="chart-box chart-box--tall">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={DIAGNOSTICO_WAIT_TIMES} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 45]} tick={{ fontSize: 10, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => `${value} dias`}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="consulta"
                  name="Consulta Especializada (SISREG)"
                  stroke="#1d4e8a"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="metaConsulta"
                  name="Meta Consulta (≤ 30d)"
                  stroke="#16a34a"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="biopsia"
                  name="Resultado Biópsia (Hospitalar)"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="metaBiopsia"
                  name="Meta Biópsia (≤ 15d)"
                  stroke="#7c3aed"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Gráfico 2: Colonoscopias por Prestador Credenciado */}
        <article className="dashboard-panel">
          <SectionHeading
            title="Colonoscopias Realizadas por Prestador"
            subtitle="Volume de exames realizados vs aguardando agendamento regulado na rede municipal"
          />
          <div className="chart-box chart-box--tall">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DIAGNOSTICO_PROVIDERS} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
                <XAxis dataKey="unidade" tick={{ fontSize: 9, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value, name) => [`${value} exames`, name]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="realizadas" name="Realizadas" fill="#1d4e8a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="pendentes" name="Aguardando Regulação" fill="#d97706" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      {/* 4. Banner informativo / Regulação e Conformidade */}
      <div className="diagnostico-compliance">
        <span className="diagnostico-compliance__icon">⚖️</span>
        <div className="diagnostico-compliance__content">
          <h4>Diretriz de Regulação — Lei dos 30 Dias (Lei 13.896/2019)</h4>
          <p>
            Em casos de suspeita de neoplasia maligna, os exames diagnósticos necessários devem ser realizados no prazo máximo de 30 dias no SUS. 
            O tempo médio para biópsia no município está em <strong>18 dias</strong> (meta ≤ 15 dias), e a proporção de colonoscopias realizadas após encaminhamento está em <strong>61,5%</strong> (meta ≥ 80%).
          </p>
        </div>
      </div>

      {/* 5. Catálogo completo e navegável da etapa (Busca, Filtro por Situação, Alternador Grid/Lista e Ficha Técnica) */}
      <IndicatorBrowser
        line={LINE_CANCER}
        indicators={CANCER_FICHA_INDICATORS}
        stage="DIAGNÓSTICO"
        stages={DIAGNOSTICO_STAGE}
        onStageChange={() => {}}
        onOpen={onOpenSheet}
        title="Indicadores da Etapa de Diagnóstico"
        allGroupsLabel="Etapa Diagnóstico"
        hint="Filtre por situação clínica ou busque pelo nome. Cada item abre a ficha técnica completa."
      />
    </div>
  );
}

export default DiagnosticoTab;
