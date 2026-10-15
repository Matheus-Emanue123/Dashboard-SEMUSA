import { STATUS_STYLES } from "../../services/overviewDashboard";

function StatusBadge({ status, label }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.stable;

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: style.background,
        color: style.color,
        borderColor: style.softBorder,
      }}
    >
      {style.symbol}
      {label ? ` ${label}` : ""}
    </span>
  );
}

export default StatusBadge;
