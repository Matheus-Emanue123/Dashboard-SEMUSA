import { useMemo } from "react";

import useIndicatorBrowser from "../../hooks/useIndicatorBrowser";
import { STATUS_STYLES } from "../../services/overviewDashboard";
import { decorateWithStage, getStageDefs, toggleStage } from "../../services/indicatorStages";
import IndicatorCompactRow from "./IndicatorCompactRow";

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
        <span className="catalog__count">{filtered.length} nesta vista</span>
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
        <div className="indicator-browser__groups">
          {grouped.map((group) => (
            <section key={group.id} className="indicator-group" aria-labelledby={`stage-${group.id}`}>
              <header className="indicator-group__head">
                <span className="indicator-group__dot" style={{ backgroundColor: group.color }} />
                <h3 id={`stage-${group.id}`}>{group.label}</h3>
                <span className="catalog__count">{group.items.length}</span>
              </header>
              <div className="indicator-group__list">
                {group.items.map((indicator) => (
                  <IndicatorCompactRow
                    key={indicator.id}
                    indicator={indicator}
                    onOpen={onOpen}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

export default IndicatorBrowser;
