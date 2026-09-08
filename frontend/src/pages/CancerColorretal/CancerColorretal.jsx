import { useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import SectionHeading from "../Dashboard/SectionHeading";
import JourneyStrip from "../../components/JourneyStrip/JourneyStrip";
import IndicatorGrid from "../../components/IndicatorGrid/IndicatorGrid";
import IndicatorBrowser from "../../components/IndicatorBrowser/IndicatorBrowser";
import DiagnosticoTab from "./DiagnosticoTab";
import { CANCER_FLOW, CANCER_FUNNEL, FUNNEL_COLORS } from "../../services/linePages";
import { CANCER_INDICATORS } from "../../services/indicators";
import { CANCER_FICHA_INDICATORS } from "../../services/catalogIndicators";
import {
  LINE_CANCER,
  countByStage,
  decorateWithStage,
  toggleStage,
} from "../../services/indicatorStages";

const STATUS_PIE = [
  { name: "OK", value: 1, color: "#2bbac2" },
  { name: "Alerta", value: 3, color: "#d97706" },
  { name: "Piora", value: 1, color: "#7c3aed" },
];

const TABS = [
  { id: "all", label: "Visão Geral do Fluxo" },
  { id: "RASTREAMENTO", label: "1. Rastreamento" },
  { id: "SUSPEITA", label: "2. Suspeita" },
  { id: "DIAGNÓSTICO", label: "3. Diagnóstico" },
  { id: "TRATAMENTO", label: "4. Tratamento" },
  { id: "DESFECHOS", label: "5. Desfechos" },
];

function CancerColorretal({ onOpenSheet }) {
  const [stage, setStage] = useState("all");
  const base = CANCER_FUNNEL[0].n;
  const staged = useMemo(
    () => decorateWithStage(CANCER_FICHA_INDICATORS, LINE_CANCER),
    [],
  );
  const stageCounts = useMemo(() => countByStage(staged), [staged]);

  return (
    <div className="line-page">
      <article className="dashboard-panel">
        <SectionHeading
          title="Fluxo assistencial — Câncer Colorretal"
          subtitle="O fluxo conecta elegibilidade, investigação, tratamento e resultados — 21 indicadores previstos"
        />
        <JourneyStrip
          steps={CANCER_FLOW}
          arrow="→"
          activeStep={stage}
          onSelectStep={(next) => setStage((current) => toggleStage(current, next))}
          stageCounts={stageCounts}
        />

        {/* Barra de Abas Padronizada (Issue #32) */}
        <nav className="line-tabs" aria-label="Navegação por abas da linha">
          {TABS.map((tab) => {
            const isActive = stage === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`line-tab ${isActive ? "is-active" : ""}`}
                aria-selected={isActive}
                onClick={() => setStage(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </article>

      {/* Renderização condicional da aba selecionada */}
      {stage === "DIAGNÓSTICO" ? (
        <DiagnosticoTab onOpenSheet={onOpenSheet} />
      ) : stage === "all" ? (
        <>
          <div className="line-page__row line-page__row--2">
            <article className="dashboard-panel">
              <SectionHeading title="Funil de rastreamento" subtitle="Município de Divinópolis · Jan/2025" />
              <div className="funnel">
                {CANCER_FUNNEL.map((step, index) => {
                  const percent = Math.round((step.n / base) * 100);
                  return (
                    <div key={step.etapa} className="funnel__row">
                      <div className="funnel__labels">
                        <span>{step.etapa}</span>
                        <span className="funnel__count">{step.n.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="funnel__track">
                        <div
                          className="funnel__fill"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: FUNNEL_COLORS[index],
                          }}
                        >
                          {percent}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="dashboard-panel">
              <SectionHeading title="Indicadores — distribuição por status" subtitle="5 indicadores · Dez 2024 – Jan 2025" />
              <div className="chart-box chart-box--tall">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={STATUS_PIE}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {STATUS_PIE.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <IndicatorGrid indicators={CANCER_INDICATORS} onOpen={onOpenSheet} />

          <IndicatorBrowser
            line={LINE_CANCER}
            indicators={CANCER_FICHA_INDICATORS}
            stage={stage}
            onStageChange={setStage}
            onOpen={onOpenSheet}
            allGroupsLabel="Todas as etapas"
            hint="Clique numa etapa do fluxo para fatiar a lista. Cada linha abre a ficha."
          />
        </>
      ) : (
        <article className="dashboard-panel">
          <SectionHeading
            title={`Aba de ${stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase()}`}
            subtitle="Esta etapa está mapeada nas issues em aberto do projeto. Abaixo você encontra os indicadores filtrados para esta fase."
          />
          <IndicatorBrowser
            line={LINE_CANCER}
            indicators={CANCER_FICHA_INDICATORS}
            stage={stage}
            onStageChange={setStage}
            onOpen={onOpenSheet}
            allGroupsLabel="Todas as etapas"
            hint="Indicadores filtrados para esta etapa. Clique para abrir a ficha técnica."
          />
        </article>
      )}
    </div>
  );
}

export default CancerColorretal;
