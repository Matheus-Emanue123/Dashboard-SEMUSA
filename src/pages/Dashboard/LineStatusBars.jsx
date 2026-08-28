import { LINE_STATUS } from "../../data/overviewDashboard";
import SectionHeading from "./SectionHeading";

const STATUS_SEGMENTS = [
  { key: "ok", color: "#2bbac2", legend: "OK" },
  { key: "alert", color: "#d97706", legend: "Alerta" },
  { key: "worsening", color: "#7c3aed", legend: "Piora" },
];

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
              {STATUS_SEGMENTS.map((segment, index) => (
                <div
                  key={segment.key}
                  className={`status-bars__segment ${index === 0 ? "is-first" : ""} ${
                    index === STATUS_SEGMENTS.length - 1 ? "is-last" : ""
                  }`}
                  style={{
                    width: getSegmentWidth(line, segment.key),
                    backgroundColor: segment.color,
                  }}
                >
                  {line[segment.key]}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="status-bars__legend">
          {STATUS_SEGMENTS.map((segment) => (
            <span key={segment.key} className="status-bars__legend-item">
              <span className="status-bars__swatch" style={{ backgroundColor: segment.color }} />
              {segment.legend}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default LineStatusBars;
