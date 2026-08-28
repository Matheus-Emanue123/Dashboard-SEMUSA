import { ATTENTION_INDICATORS, STATUS_STYLES } from "../../data/overviewDashboard";
import SectionHeading from "./SectionHeading";

function AttentionList() {
  return (
    <article className="dashboard-panel attention-list">
      <SectionHeading
        title="Indicadores que exigem atenção"
        subtitle="Lista priorizada"
      />

      <ul className="attention-list__items">
        {ATTENTION_INDICATORS.map((item) => {
          const status = STATUS_STYLES[item.status];

          return (
            <li
              key={item.label}
              className="attention-item"
              style={{ backgroundColor: status.background }}
            >
              <span
                className="attention-item__badge"
                style={{ backgroundColor: status.color }}
                aria-hidden="true"
              >
                {status.symbol}
              </span>
              <div>
                <p className="attention-item__label">{item.label}</p>
                <p className="attention-item__line">{item.line}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default AttentionList;
