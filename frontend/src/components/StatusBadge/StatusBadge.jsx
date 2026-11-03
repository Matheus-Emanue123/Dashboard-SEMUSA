import { STATUS_STYLES } from "../../services/overviewDashboard";

function StatusBadge({ status, label }) {
  const style = status === "unevaluated"
    ? { color: "#5a7080", background: "#f0f3f6", softBorder: "#d0dcea", symbol: "—" }
    : STATUS_STYLES[status] ?? STATUS_STYLES.stable;

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
      {label ? ` ${label}` : status === "unevaluated" ? " Não avaliado" : ""}
    </span>
  );
}

export default StatusBadge;
