import { useMemo, useState } from "react";

import useIndicatorBrowser from "../../hooks/useIndicatorBrowser";
import { STATUS_STYLES } from "../../services/overviewDashboard";
import { decorateWithStage, getStageDefs, toggleStage } from "../../services/indicatorStages";
import ViewToggle from "../ViewToggle/ViewToggle";
import IndicatorGroupList from "./IndicatorGroupList";

function IndicatorBrowser({
  indicators,
  line,
  stages: stagesProp,
  stage,
  onStageChange,
  onOpen,
  title = "Todos os indicadores da linha",
  allGroupsLabel = "Todos os grupos",
  hint = "Filtre por grupo ou situação. Cada linha abre a ficha técnica.",
}) {
  const [view, setView] = useState("grid");
  const stages = stagesProp ?? getStageDefs(line);
  const decorated = useMemo(
    () => decorateWithStage(indicators, line),
    [indicators, line],
  );

  const { query, setQuery, status, setStatus, filtered, grouped } = useIndicatorBrowser({
    indicators: decorated,
    stage,
    stages,
  });

  return (
    <section className="indicator-browser" aria-label={title}>
      <div className="indicator-browser__head">
        <div>
          <p className="line-kicker">{title}</p>
          <p className="indicator-browser__hint">{hint}</p>
        </div>
        <div className="view-toggle-wrap">
          <ViewToggle view={view} onChange={setView} />
          <span className="catalog__count">{filtered.length} nesta vista</span>
        </div>
      </div>

      <div className="indicator-browser__toolbar">
        <input
          className="catalog__search"
          type="search"
          placeholder="Buscar nesta linha..."
          aria-label="Buscar indicador nesta linha"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="catalog__filters" role="group" aria-label="Filtrar por situação">
          <button
            type="button"
            className={`catalog__chip ${status === "all" ? "is-active" : ""}`}
            onClick={() => setStatus("all")}
          >
            Todos
          </button>
          {Object.entries(STATUS_STYLES).map(([key, style]) => (
            <button
              key={key}
              type="button"
              className="catalog__chip"
              style={
                status === key
                  ? { backgroundColor: style.color, color: "#fff", borderColor: style.color }
                  : { color: style.color, borderColor: `${style.color}50`, backgroundColor: style.background }
              }
              onClick={() => setStatus(key)}
            >
              {style.symbol} {style.label}
            </button>
          ))}
        </div>
      </div>

      {stages.length > 0 ? (
        <div className="catalog__filters" role="group" aria-label="Filtrar por grupo">
          <button
            type="button"
            className={`catalog__chip ${stage === "all" ? "is-active" : ""}`}
            onClick={() => onStageChange("all")}
          >
            {allGroupsLabel}
          </button>
          {stages.map((item) => (
            <button
              key={item.id}
              type="button"
              className="catalog__chip"
              style={
                stage === item.id
                  ? { backgroundColor: item.color, color: "#fff", borderColor: item.color }
                  : { color: item.color, borderColor: `${item.color}50`, backgroundColor: `${item.color}14` }
              }
              onClick={() => onStageChange(toggleStage(stage, item.id))}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {grouped.length === 0 ? (
        <p className="indicator-browser__empty">Nenhum indicador para esta combinação de filtros.</p>
      ) : (
        <IndicatorGroupList grouped={grouped} view={view} onOpen={onOpen} />
      )}
    </section>
  );
}

export default IndicatorBrowser;
