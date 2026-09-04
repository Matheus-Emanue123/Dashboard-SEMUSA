import { Fragment } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { LINE_SUMMARY_CARDS, STATUS_STYLES } from "../../services/overviewDashboard";

const COLUMNS = ["Indicador", "Linha", "Valor", "Meta", "Situação", "Tendência", "Fonte", "Freq."];

function CatalogTable({ groups, onOpen }) {
  return (
    <div className="catalog__table-wrap">
      <table className="catalog__table">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.id}>
              {group.label ? (
                <tr className="catalog__stage-row">
                  <td colSpan={COLUMNS.length}>
                    <span className="indicator-group__dot" style={{ backgroundColor: group.color }} />
                    {group.label}
                    <small>{group.items.length}</small>
                  </td>
                </tr>
              ) : null}
              {group.items.map((indicator, index) => {
                const line = LINE_SUMMARY_CARDS.find((card) => card.label === indicator.line);

                return (
                  <tr
                    key={indicator.id}
                    style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafcfe" }}
                    onClick={() => onOpen(indicator)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpen(indicator);
                      }
                    }}
                    tabIndex={0}
                  >
                    <td className="catalog__name">{indicator.name}</td>
                    <td>
                      <span
                        className="catalog__line"
                        style={{
                          backgroundColor: line?.background ?? "#f0f0f0",
                          color: line?.color ?? "#6b7280",
                        }}
                      >
                        {indicator.line}
                      </span>
                    </td>
                    <td className="is-mono">
                      {indicator.value} {indicator.unit ? <small>{indicator.unit}</small> : null}
                    </td>
                    <td className="is-mono catalog__muted">{indicator.parameter}</td>
                    <td>
                      <StatusBadge status={indicator.status} />
                    </td>
                    <td>
                      <span className="is-mono" style={{ color: STATUS_STYLES[indicator.status]?.color }}>
                        {indicator.trend}
                      </span>
                    </td>
                    <td className="catalog__muted">{indicator.source}</td>
                    <td className="catalog__muted">{indicator.frequency}</td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CatalogTable;
