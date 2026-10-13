import { ALERT_INDICATORS } from "../../services/catalogIndicators";
import { STATUS_STYLES } from "../../services/overviewDashboard";
import SectionHeading from "./SectionHeading";

function AttentionList() {
  return (
    <article className="dashboard-panel attention-list">
      <SectionHeading
        title="Indicadores em alerta"
        subtitle="Valores demonstrativos fora do parâmetro informado"
      />

      <ul className="attention-list__items">
        {ALERT_INDICATORS.length ? ALERT_INDICATORS.map((item) => {
          const status = STATUS_STYLES.alert;
          const value = item.unit && !item.value.endsWith(item.unit)
            ? `${item.value} ${item.unit}`
            : item.value;

          return (
            <li
              key={item.id}
              className="attention-item"
              style={{ backgroundColor: status.background, borderColor: status.softBorder }}
            >
              <span
                className="attention-item__badge"
                style={{ backgroundColor: status.color }}
                aria-hidden="true"
              >
                {status.symbol}
              </span>
              <div>
                <p className="attention-item__label">{item.name}</p>
                <p className="attention-item__line">{item.line}</p>
                <p className="attention-item__comparison">
                  Atual: <strong>{value}</strong>
                  <span aria-hidden="true"> · </span>
                  Parâmetro: <strong>{item.parameter}</strong>
                </p>
                {item.trend !== "—" ? (
                  <p className="attention-item__trend">
                    Tendência: {item.trend}
                  </p>
                ) : null}
              </div>
            </li>
          );
        }) : <li className="attention-list__empty">Nenhum indicador demonstrativo fora do parâmetro.</li>}
      </ul>
    </article>
  );
}

export default AttentionList;
