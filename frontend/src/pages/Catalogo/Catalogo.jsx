import { useEffect, useMemo, useState } from "react";

import { LINE_SUMMARY_CARDS, STATUS_STYLES } from "../../services/overviewDashboard";
import { CATALOG_GROUPS, CATALOG_INDICATORS } from "../../services/catalogIndicators";
import {
  decorateWithStage,
  getStageDefs,
  groupByStage,
  toggleStage,
} from "../../services/indicatorStages";
import CatalogTable from "./CatalogTable";

function Catalogo({ onOpenSheet }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const stagedCatalog = useMemo(() => decorateWithStage(CATALOG_INDICATORS), []);
  const stageDefs = getStageDefs(groupFilter);

  useEffect(() => {
    setStageFilter("all");
  }, [groupFilter]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return stagedCatalog.filter((indicator) => {
      const matchesQuery = indicator.name.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "all" || indicator.status === statusFilter;
      const matchesGroup = groupFilter === "all" || indicator.line === groupFilter;
      const matchesStage = stageFilter === "all" || indicator.stageId === stageFilter;
      return matchesQuery && matchesStatus && matchesGroup && matchesStage;
    });
  }, [stagedCatalog, query, statusFilter, groupFilter, stageFilter]);

  const groups = useMemo(() => {
    if (groupFilter === "all") {
      return CATALOG_GROUPS.filter((group) => group.id !== "all")
        .map((group) => {
          const card = LINE_SUMMARY_CARDS.find((item) => item.label === group.id);
          return {
            id: group.id,
            label: group.label,
            color: card?.color ?? "#6b7280",
            items: filtered.filter((indicator) => indicator.line === group.id),
          };
        })
        .filter((group) => group.items.length > 0);
    }

    if (stageDefs.length === 0) {
      return [{ id: groupFilter, label: null, items: filtered }];
    }

    return groupByStage(filtered, stageDefs);
  }, [filtered, groupFilter, stageDefs]);

  return (
    <div className="catalog">
      <div className="catalog__toolbar">
        <input
          className="catalog__search"
          type="search"
          placeholder="Buscar indicador..."
          aria-label="Buscar indicador no catálogo"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="catalog__filters" role="group" aria-label="Filtrar por situação">
          <button
            type="button"
            className={`catalog__chip ${statusFilter === "all" ? "is-active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Todos
          </button>
          {Object.entries(STATUS_STYLES).map(([key, style]) => (
            <button
              key={key}
              type="button"
              className="catalog__chip"
              style={
                statusFilter === key
                  ? { backgroundColor: style.color, color: "#fff", borderColor: style.color }
                  : { color: style.color, borderColor: `${style.color}50`, backgroundColor: style.background }
              }
              onClick={() => setStatusFilter(key)}
            >
              {style.symbol} {style.label}
            </button>
          ))}
        </div>

        <span className="catalog__count">{filtered.length} indicadores</span>
      </div>

      <div className="catalog__groups" role="group" aria-label="Filtrar por linha de cuidado">
        {CATALOG_GROUPS.map((group) => {
          const card = LINE_SUMMARY_CARDS.find((item) => item.label === group.id);
          const isActive = groupFilter === group.id;

          return (
            <button
              key={group.id}
              type="button"
              className={`catalog__chip ${isActive ? "is-active" : ""}`}
              style={
                group.id !== "all" && card
                  ? isActive
                    ? { backgroundColor: card.color, color: "#fff", borderColor: card.color }
                    : { color: card.color, borderColor: `${card.color}50`, backgroundColor: card.background }
                  : undefined
              }
              onClick={() => setGroupFilter(group.id)}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      {stageDefs.length > 0 ? (
        <div className="catalog__groups" role="group" aria-label="Filtrar por etapa ou grupo">
          <button
            type="button"
            className={`catalog__chip ${stageFilter === "all" ? "is-active" : ""}`}
            onClick={() => setStageFilter("all")}
          >
            Todas as etapas
          </button>
          {stageDefs.map((item) => (
            <button
              key={item.id}
              type="button"
              className="catalog__chip"
              style={
                stageFilter === item.id
                  ? { backgroundColor: item.color, color: "#fff", borderColor: item.color }
                  : { color: item.color, borderColor: `${item.color}50`, backgroundColor: `${item.color}14` }
              }
              onClick={() => setStageFilter((current) => toggleStage(current, item.id))}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="indicator-browser__empty">Nenhum indicador para esta combinação de filtros.</p>
      ) : (
        <CatalogTable groups={groups} onOpen={onOpenSheet} />
      )}
    </div>
  );
}

export default Catalogo;
