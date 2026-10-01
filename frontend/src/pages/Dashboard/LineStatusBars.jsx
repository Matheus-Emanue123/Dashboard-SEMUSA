import { LINE_STATUS, STATUS_STYLES } from "../../services/overviewDashboard";
import SectionHeading from "./SectionHeading";

const STATUS_SEGMENTS = ["ok", "alert", "worsening"];

function getSegmentWidth(line, key) {
  const total = line.ok + line.alert + line.worsening;
  return `${(line[key] / total) * 100}%`;
}

function LineStatusBars() {
  return (
    <article className="dashboard-panel">
      <SectionHeading
        title="Situação dos indicadores por linha"
        subtitle="OK · Alerta · Piora"
      />

      <div className="status-bars">
        {LINE_STATUS.map((line) => (
          <div key={line.linha} className="status-bars__row">
            <p className="status-bars__label">{line.linha}</p>
            <div className="status-bars__track">
              {STATUS_SEGMENTS.map((status, index) => {
                const style = STATUS_STYLES[status];
                return (
                  <div
                    key={status}
                    className={`status-bars__segment ${index === 0 ? "is-first" : ""} ${
                      index === STATUS_SEGMENTS.length - 1 ? "is-last" : ""
                    }`}
                    style={{
                      width: getSegmentWidth(line, status),
                      backgroundColor: style.color,
                    }}
                  >
                    {line[status]}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="status-bars__legend">
          {STATUS_SEGMENTS.map((status) => {
            const style = STATUS_STYLES[status];
            return (
              <span key={status} className="status-bars__legend-item">
                <span className="status-bars__swatch" style={{ backgroundColor: style.color }} />
                {style.label}
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export default LineStatusBars;
