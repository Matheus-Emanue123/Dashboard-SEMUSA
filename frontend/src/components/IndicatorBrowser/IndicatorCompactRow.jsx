import StatusBadge from "../StatusBadge/StatusBadge";
import { STATUS_STYLES } from "../../services/overviewDashboard";

function IndicatorCompactRow({ indicator, onOpen }) {
  const status = STATUS_STYLES[indicator.status] ?? STATUS_STYLES.stable;
  const hasValue = indicator.value && indicator.value !== "—";

  return (
    <button
      type="button"
      className="indicator-row"
      style={{ borderLeftColor: status.color }}
      onClick={() => onOpen?.(indicator)}
    >
      <span className="indicator-row__name">{indicator.name}</span>

      <span className="indicator-row__value is-mono">
        {hasValue ? (
          <>
            {indicator.value}
            {indicator.unit ? <small> {indicator.unit}</small> : null}
          </>
        ) : (
          <small>Sem valor</small>
        )}
      </span>

      <span className="indicator-row__meta">
        <small>Meta {indicator.parameter}</small>
        <StatusBadge status={indicator.status} />
      </span>
    </button>
  );
}

export default IndicatorCompactRow;
