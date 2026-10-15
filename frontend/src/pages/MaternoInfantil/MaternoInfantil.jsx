import { useMemo, useRef, useState } from "react";
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

import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../services/api";

import { STATUS_STYLES } from "../../services/overviewDashboard";
import SectionHeading from "../Dashboard/SectionHeading";
import JourneyStrip from "../../components/JourneyStrip/JourneyStrip";
import IndicatorGrid from "../../components/IndicatorGrid/IndicatorGrid";
import IndicatorBrowser from "../../components/IndicatorBrowser/IndicatorBrowser";
import {
  MATERNO_JOURNEY,
  MATERNO_STAGE_COVERAGE,
  MATERNO_UBS_COVERAGE,
} from "../../services/linePages";
import { MATERNO_INDICATORS } from "../../services/indicators";
import { MATERNO_FICHA_INDICATORS } from "../../services/catalogIndicators";
import {
  LINE_MATERNO,
  countByStage,
  decorateWithStage,
  toggleStage,
} from "../../services/indicatorStages";

const STATUS_PIE = [
  { name: STATUS_STYLES.ok.label, value: 2, color: STATUS_STYLES.ok.color },
  { name: STATUS_STYLES.alert.label, value: 3, color: STATUS_STYLES.alert.color },
  { name: STATUS_STYLES.worsening.label, value: 1, color: STATUS_STYLES.worsening.color },
];

function MaternoInfantil({ onOpenSheet }) {
  const { hasRole, loading } = useAuth();
  const canImport = !loading && hasRole("OPERADOR");
  const fileInput = useRef(null);
  const sending = useRef(false);
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [stage, setStage] = useState("all");
  const staged = useMemo(
    () => decorateWithStage(MATERNO_FICHA_INDICATORS, LINE_MATERNO),
    [],
  );
  const stageCounts = useMemo(() => countByStage(staged), [staged]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !canImport || sending.current) return;

    setFeedback(null);
    if (!/\.xlsx$/i.test(file.name)) {
      setFeedback({ error: true, message: "Selecione um arquivo .xlsx válido." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ error: true, message: "O arquivo excede o limite de 5 MiB." });
      return;
    }

    sending.current = true;
    setImporting(true);
    try {
      const body = new FormData();
      body.append("arquivo", file);
      const result = await apiFetch("/materno-infantil/importar", { method: "POST", body });
      setFeedback({ message: `Importação concluída: ${result.importadas} linhas importadas e ${result.ignoradas} ignoradas.` });
    } catch (error) {
      let message;
      if (error.status === 401) message = "Sua sessão expirou. Entre novamente para importar.";
      else if (error.status === 403) message = "Somente usuários com perfil OPERADOR podem importar planilhas.";
      else if (error.status === 413) message = "O arquivo excede o limite de 5 MiB.";
      else if (error.status >= 500) message = "Erro interno ao importar. A importação pode não ter sido concluída; consulte o responsável antes de reenviar.";
      else if (!error.status) message = "Não foi possível conectar ao servidor. Verifique sua conexão. Se o envio já começou, confirme o resultado antes de reenviar.";
      else message = error.message || "Não foi possível importar a planilha.";
      setFeedback({ error: true, message, errors: Array.isArray(error.erros) ? error.erros : [] });
    } finally {
      sending.current = false;
      setImporting(false);
    }
  };

  return (
    <div className="line-page">
      <article className="dashboard-panel">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "flex-start" }}>
          <SectionHeading
            title="Jornada do cuidado materno-infantil"
            subtitle="Os indicadores percorrem gestação, parto, puerpério, recém-nascido e infância — 41 indicadores previstos"
          />
          {canImport && (
            <>
              <input
                ref={fileInput}
                type="file"
                accept=".xlsx"
                aria-label="Selecionar planilha materno-infantil"
                hidden
                disabled={importing}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={importing}
                aria-busy={importing}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  backgroundColor: "#1d4e8a", // Azul mais chamativo e sólido
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#ffffff", // Texto branco para destacar
                  cursor: importing ? "wait" : "pointer",
                  opacity: importing ? 0.7 : 1,
                  boxShadow: "0 2px 4px rgba(29, 78, 138, 0.2)",
                  whiteSpace: "nowrap",
                  marginTop: "4px",
                  transition: "background-color 0.2s ease"
                }}
              >
                {importing ? "Importando..." : "Importar Planilha"}
              </button>
            </>
          )}
        </div>
        {feedback && (
          <div role={feedback.error ? "alert" : "status"} style={{ marginBlock: "12px", overflowWrap: "anywhere" }}>
            <p>{feedback.message}</p>
            {feedback.errors?.length > 0 && (
              <ul style={{ maxHeight: "240px", overflowY: "auto" }}>
                {feedback.errors.map((error, index) => (
                  <li key={`${error.linha}-${index}`}>Linha {error.linha}: {error.motivo}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <JourneyStrip
          steps={MATERNO_JOURNEY}
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
              <BarChart data={MATERNO_STAGE_COVERAGE} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#5a7080" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="etapa" tick={{ fontSize: 10, fill: "#5a7080" }} width={90} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {MATERNO_STAGE_COVERAGE.map((item, index) => (
                    <Cell key={item.etapa} fill={MATERNO_JOURNEY[index].color} />
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
              <BarChart data={MATERNO_UBS_COVERAGE} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
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

      <IndicatorGrid indicators={MATERNO_INDICATORS} onOpen={onOpenSheet} />

      <IndicatorBrowser
        line={LINE_MATERNO}
        indicators={MATERNO_FICHA_INDICATORS}
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