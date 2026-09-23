//OK - precisa testar 
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import SectionHeading from "../Dashboard/SectionHeading";
import JourneyStrip from "../../components/JourneyStrip/JourneyStrip";
import IndicatorGrid from "../../components/IndicatorGrid/IndicatorGrid";
import IndicatorBrowser from "../../components/IndicatorBrowser/IndicatorBrowser";
import {
  LINE_MATERNO,
  countByStage,
  decorateWithStage,
  toggleStage,
} from "../../services/indicatorStages";

const STATUS_PIE = [
  { name: "OK", value: 2, color: "#2bbac2" },
  { name: "Alerta", value: 3, color: "#d97706" },
  { name: "Piora", value: 1, color: "#7c3aed" },
];

function MaternoInfantil({ onOpenSheet }) {
  const [journey, setJourney] = useState([]);
  const [stageCoverage, setStageCoverage] = useState([]);
  const [ubsCoverage, setUbsCoverage] = useState([]);
  const [allIndicators, setAllIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("all");

  useEffect(() => {
    Promise.all([
      apiGet("materno/jornada"),
      apiGet("materno/cobertura-etapas"),
      apiGet("materno/cobertura-ubs"),
      apiGet("indicadores"),
    ])
      .then(([journeyData, stageCoverageData, ubsCoverageData, indicatorsData]) => {
        setJourney(journeyData);
        setStageCoverage(stageCoverageData);
        setUbsCoverage(ubsCoverageData);
        setAllIndicators(indicatorsData);
      })
      .catch((err) => {
        console.error("Erro ao carregar a página Materno-Infantil:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const maternalIndicators = useMemo(
    () => allIndicators.filter((indicator) => indicator.line === LINE_MATERNO),
    [allIndicators],
  );
  const highlightIndicators = useMemo(
    () => maternalIndicators.filter((indicator) => indicator.isHighlightCard),
    [maternalIndicators],
  );
  const catalogIndicators = useMemo(
    () => maternalIndicators.filter((indicator) => indicator.isCatalogItem),
    [maternalIndicators],
  );
  const staged = useMemo(
    () => decorateWithStage(catalogIndicators, LINE_MATERNO),
    [catalogIndicators],
  );
  const stageCounts = useMemo(() => countByStage(staged), [staged]);

  if (loading) {
    return <p className="indicator-browser__empty">Carregando dados materno-infantis...</p>;
  }

  if (error) {
    return (
      <p className="indicator-browser__empty">
        Não foi possível carregar os dados materno-infantis.
      </p>
    );
  }

  return (
    <div className="line-page">
      <article className="dashboard-panel">
        <SectionHeading
          title="Jornada do cuidado materno-infantil"
          subtitle="Os indicadores percorrem gestação, parto, puerpério, recém-nascido e infância — 41 indicadores previstos"
        />
        <JourneyStrip
          steps={journey}
          numbered
          activeStep={stage}
          onSelectStep={(next) => setStage((current) => toggleStage(current, next))}
          stageCounts={stageCounts}
        />
      </article>

      <div className="line-page__row line-page__row--3">
        <article className="dashboard-panel">
          <SectionHeading title="Cobertura por etapa (%)" subtitle="Jan/2025 · meta ≥ 80%" />
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageCoverage} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="etapa" tick={{ fontSize: 10, fill: "#5a7080" }} width={90} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {stageCoverage.map((item, index) => (
                    <Cell key={item.etapa} fill={journey[index]?.color ?? "#2bbac2"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel">
          <SectionHeading title="Cobertura pré-natal por UBS (%)" subtitle="Início no 1º trimestre · Jan/2025" />
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ubsCoverage} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
                <XAxis dataKey="ubs" tick={{ fontSize: 9, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="pn" name="Pré-natal" fill="#2bbac2" radius={[3, 3, 0, 0]} />
                <Bar dataKey="vac" name="Vacinal" fill="#1d4e8a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel">
          <SectionHeading title="Distribuição por status" subtitle="6 indicadores priorizados" />
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={STATUS_PIE} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                  {STATUS_PIE.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <IndicatorGrid indicators={highlightIndicators} onOpen={onOpenSheet} />

      <IndicatorBrowser
        line={LINE_MATERNO}
        indicators={catalogIndicators}
        stage={stage}
        onStageChange={setStage}
        onOpen={onOpenSheet}
        allGroupsLabel="Todas as etapas"
        hint="Clique numa etapa da jornada para fatiar a lista. Cada linha abre a ficha."
      />
    </div>
  );
}

export default MaternoInfantil;
