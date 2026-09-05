import { STATUS_STYLES } from "../../services/overviewDashboard";
import StatusBadge from "../StatusBadge/StatusBadge";

function IndicatorCard({ indicator, onOpen }) {
  const status = STATUS_STYLES[indicator.status] ?? STATUS_STYLES.stable;

  return (
    <button
      type="button"
      className="indicator-card"
      style={{ borderLeftColor: status.color }}
      onClick={() => onOpen?.(indicator)}
    >
      <div className="indicator-card__top">
        <p className="indicator-card__name">{indicator.name}</p>
        <StatusBadge status={indicator.status} />
      </div>

      <div className="indicator-card__metrics">
        <span className="indicator-card__value">{indicator.value}</span>
        <span className="indicator-card__unit">{indicator.unit}</span>
        <span className="indicator-card__trend" style={{ color: status.color }}>
          {indicator.trend}
        </span>
      </div>

      <div className="indicator-card__meta">
        <span>
          Meta: <strong style={{ color: status.color }}>{indicator.parameter}</strong>
        </span>
        <span>{indicator.period}</span>
      </div>
    </button>
  );
}

export default IndicatorCard;
