import { Fragment, useMemo, useState } from "react";
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

import SectionHeading from "../Dashboard/SectionHeading";
import IndicatorBrowser from "../../components/IndicatorBrowser/IndicatorBrowser";
import { ACCESS_BARS, NETWORK_LEVELS, WAIT_TIME_SERIES } from "../../services/linePages";
import { NAVEGACAO_INDICATORS } from "../../services/indicators";
import {
  LINE_NAVEGACAO,
  NETWORK_STAGE_BY_LEVEL,
  countByStage,
  decorateWithStage,
  toggleStage,
} from "../../services/indicatorStages";

function NavegacaoCuidado({ onOpenSheet }) {
  const [stage, setStage] = useState("all");
  const staged = useMemo(
    () => decorateWithStage(NAVEGACAO_INDICATORS, LINE_NAVEGACAO),
    [],
  );
  const stageCounts = useMemo(() => countByStage(staged), [staged]);

  return (
    <div className="line-page">
      <article className="dashboard-panel">
        <SectionHeading
          title="Fluxo da rede de atenção à saúde"
          subtitle="Atenção Primária → Especialidades → Hospital · 18 indicadores previstos"
        />
        <div className="network-flow">
          {NETWORK_LEVELS.map((level, index) => {
            const stageId = NETWORK_STAGE_BY_LEVEL[level.nivel];
            const isActive = stage === stageId;

            const canFilter = (stageCounts[stageId] ?? 0) > 0;

            return (
              <Fragment key={level.nivel}>
                <button
                  type="button"
                  className={`network-card ${isActive ? "is-active" : ""}`}
                  style={{
                    borderColor: isActive ? level.color : `${level.color}40`,
                    backgroundColor: `${level.color}12`,
                    color: level.color,
                  }}
                  aria-pressed={canFilter ? isActive : undefined}
                  disabled={!canFilter}
                  onClick={() => setStage((current) => toggleStage(current, stageId))}
                >
                  <p style={{ color: level.color }}>{level.nivel}</p>
                  <strong style={{ color: level.color }}>{level.consultas.toLocaleString("pt-BR")}</strong>
                  <span>consultas/ano</span>
                  <small style={{ color: level.color, visibility: level.encaminhamentos > 0 ? "visible" : "hidden" }}>
                    {(level.encaminhamentos || 0).toLocaleString("pt-BR")} encaminhamentos
                  </small>
                  <em className="network-card__count">{stageCounts[stageId] ?? 0} indicadores</em>
                </button>
                {index < NETWORK_LEVELS.length - 1 ? <span className="network-flow__arrow">→</span> : null}
              </Fragment>
            );
          })}
        </div>
      </article>

      <div className="line-page__row line-page__row--2">
        <article className="dashboard-panel">
          <SectionHeading
            title="Tempo médio de espera — especialidade (dias)"
            subtitle="Meta: ≤ 30 dias · Ago 2024 – Jan 2025"
          />
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={WAIT_TIME_SERIES} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 60]} tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value} dias`} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="espera" name="Tempo real" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="meta" name="Meta" stroke="#16a34a" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel">
          <SectionHeading title="Resolubilidade e cobertura" subtitle="Indicadores de acesso e continuidade do cuidado" />
          <div className="access-bars">
            {ACCESS_BARS.map((item) => (
              <div key={item.label}>
                <div className="access-bars__labels">
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className="access-bars__track">
                  <div className="access-bars__fill" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
                <p className="access-bars__meta">meta: {item.meta}%</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <IndicatorBrowser
        line={LINE_NAVEGACAO}
        indicators={NAVEGACAO_INDICATORS}
        stage={stage}
        onStageChange={setStage}
        onOpen={onOpenSheet}
        allGroupsLabel="Toda a rede"
        hint="Clique num nível da rede para ver os indicadores daquele ponto."
      />
    </div>
  );
}

export default NavegacaoCuidado;
