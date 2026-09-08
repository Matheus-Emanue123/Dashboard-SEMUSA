// import { ATTENTION_INDICATORS, STATUS_STYLES } from "../../services/overviewDashboard";
import { STATUS_STYLES } from "../../services/overviewDashboard";
import { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
import SectionHeading from "./SectionHeading";

function AttentionList() {
   const [cards, setCards] = useState([]);

  useEffect(() => {
    apiGet("indicadores-atencao")
      .then(setCards)
      .catch((err) => console.error("Erro ao carregar indicadores de atenção:", err));
  }, []);
  return (
    <article className="dashboard-panel attention-list">
      <SectionHeading
        title="Indicadores que exigem atenção"
        subtitle="Lista priorizada"
      />

      <ul className="attention-list__items">
        {cards.map((item) => {
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
