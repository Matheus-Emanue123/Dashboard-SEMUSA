//preciso verificar se a integração funcionou
import {useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import SectionHeading from "../Dashboard/SectionHeading";
import JourneyStrip from "../../components/JourneyStrip/JourneyStrip";
import IndicatorGrid from "../../components/IndicatorGrid/IndicatorGrid";
import IndicatorBrowser from "../../components/IndicatorBrowser/IndicatorBrowser";
//import { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
//import { CANCER_FLOW, CANCER_FUNNEL, FUNNEL_COLORS } from "../../services/linePages";
//import { CANCER_INDICATORS } from "../../services/indicators";
//import { CANCER_FICHA_INDICATORS } from "../../services/catalogIndicators";
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

function CancerColorretal({ onOpenSheet }) {

const [flow, setFlow] = useState([]);
const [funnel, setFunnel] = useState([]);
const [allIndicators, setAllIndicators] = useState([]);

  useEffect(() => {
    apiGet("cancer/fluxo")
      .then(setFlow)
      .catch((err) => console.error("Erro ao carregar indicadores de fluxo:", err));
  }, []);

   useEffect(() => {
    apiGet("cancer/funil")
      .then(setFunnel)
      .catch((err) => console.error("Erro ao carregar indicadores de funil:", err));
  }, []);

   useEffect(() => {
    apiGet("indicadores")
      .then(setAllIndicators)
      .catch((err) => console.error("Erro ao carregar indicadores do câncer:", err));
  }, []);

const cancerIndicators = useMemo(
  () =>
    allIndicators.filter(
      (indicator) => indicator.line === LINE_CANCER,
    ),
  [allIndicators],
);

const highlightIndicators = useMemo(
  () =>
    cancerIndicators.filter(
      (indicator) => indicator.isHighlightCard,
    ),
  [cancerIndicators],
);

const catalogIndicators = useMemo(
  () =>
    cancerIndicators.filter(
      (indicator) => indicator.isCatalogItem,
    ),
  [cancerIndicators],
);

  const [stage, setStage] = useState("all");
  const base = funnel[0]?.n ?? 1;
  const staged = useMemo(
    () => decorateWithStage(catalogIndicators, LINE_CANCER),
    [catalogIndicators],
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
          steps={flow}
          arrow="→"
          activeStep={stage}
          onSelectStep={(next) => setStage((current) => toggleStage(current, next))}
          stageCounts={stageCounts}
        />
      </article>

      <div className="line-page__row line-page__row--2">
        <article className="dashboard-panel">
          <SectionHeading title="Funil de rastreamento" subtitle="Município de Divinópolis · Jan/2025" />
          <div className="funnel">
            {funnel.map((step, index) => {
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
                        backgroundColor: step.color ?? "#1d4e8a",
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

      <IndicatorGrid indicators={highlightIndicators} onOpen={onOpenSheet} />

      <IndicatorBrowser
        line={LINE_CANCER}
        indicators={catalogIndicators}
        stage={stage}
        onStageChange={setStage}
        onOpen={onOpenSheet}
        allGroupsLabel="Todas as etapas"
        hint="Clique numa etapa do fluxo para fatiar a lista. Cada linha abre a ficha."
      />
    </div>
  );
}

export default CancerColorretal;
