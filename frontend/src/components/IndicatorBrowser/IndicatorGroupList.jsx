import IndicatorCard from "../IndicatorCard/IndicatorCard";
import IndicatorCompactRow from "./IndicatorCompactRow";

function IndicatorGroupList({ grouped, view = "list", onOpen }) {
  return (
    <div className="indicator-browser__groups">
      {grouped.map((group) => (
        <section key={group.id} className="indicator-group" aria-labelledby={group.label ? `stage-${group.id}` : undefined}>
          {group.label ? (
            <header className="indicator-group__head">
              <span className="indicator-group__dot" style={{ backgroundColor: group.color }} />
              <h3 id={`stage-${group.id}`}>{group.label}</h3>
              <span className="catalog__count">{group.items.length}</span>
            </header>
          ) : null}

          <div className={view === "grid" ? "indicator-grid indicator-group__grid" : "indicator-group__list"}>
            {group.items.map((indicator) =>
              view === "grid" ? (
                <IndicatorCard key={indicator.id} indicator={indicator} onOpen={onOpen} />
              ) : (
                <IndicatorCompactRow key={indicator.id} indicator={indicator} onOpen={onOpen} />
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export default IndicatorGroupList;
