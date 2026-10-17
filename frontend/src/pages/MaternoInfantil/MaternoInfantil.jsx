import { useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../services/api";

import { useMaternoResults } from "../../hooks/useMaternoResults";
import { MATERNO_PRIORITIZED_IDS } from "../../services/maternoResults";
import CoverageChart from "../Dashboard/CoverageChart";
import SectionHeading from "../Dashboard/SectionHeading";
import JourneyStrip from "../../components/JourneyStrip/JourneyStrip";
import IndicatorGrid from "../../components/IndicatorGrid/IndicatorGrid";
import IndicatorBrowser from "../../components/IndicatorBrowser/IndicatorBrowser";
import { MATERNO_JOURNEY } from "../../services/linePages";
import {
  LINE_MATERNO,
  countByStage,
  decorateWithStage,
  toggleStage,
} from "../../services/indicatorStages";

function MaternoInfantil({ onOpenSheet }) {
  const { hasRole, loading } = useAuth();
  const { indicators, reload, error: resultsError, loading: resultsLoading } = useMaternoResults();
  const prioritized = MATERNO_PRIORITIZED_IDS.map(id => indicators.find(item => item.id === id));
  const canImport = !loading && hasRole("OPERADOR");
  const fileInput = useRef(null);
  const sending = useRef(false);
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [stage, setStage] = useState("all");
  const staged = useMemo(
    () => decorateWithStage(indicators, LINE_MATERNO),
    [indicators],
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
      await reload();
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

      {resultsLoading && <p role="status">Carregando resultados...</p>}
      {resultsError && <div role="alert"><p>{resultsError}</p><button type="button" onClick={reload}>Tentar novamente</button></div>}
      <div className="line-page__row line-page__row--3">
        {[
          ['Cobertura por etapa (%)', 'Sem dados: a planilha não fornece cobertura consolidada por etapa.'],
          ['Cobertura pré-natal por UBS (%)', 'Sem dados: a planilha não contém a dimensão UBS.'],
          ['Distribuição por status', 'Não avaliada: os resultados importados não possuem parâmetros canônicos definidos.'],
        ].map(([title, message]) => <article key={title} className="dashboard-panel"><SectionHeading title={title} /><p role="status">{message}</p></article>)}
      </div>
      <CoverageChart maternoOnly />

      <IndicatorGrid indicators={prioritized} onOpen={onOpenSheet} />

      <IndicatorBrowser
        line={LINE_MATERNO}
        indicators={indicators}
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