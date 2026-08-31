import { useEffect } from "react";

import { STATUS_DESCRIPTIONS, STATUS_STYLES } from "../../services/overviewDashboard";
import StatusBadge from "../StatusBadge/StatusBadge";

const TRACEABILITY = (indicator) => [
  { color: "#2bbac2", label: "Última atualização", value: indicator.period },
  { color: "#1d4e8a", label: "Período de referência", value: indicator.period },
  { color: "#d97706", label: "Histórico de correções", value: "Nenhum" },
  { color: "#d97706", label: "Completude estimada", value: "≥ 85%" },
  { color: "#16a34a", label: "Regra de cálculo", value: "Validada pela SEMUSA" },
  { color: "#6b7280", label: "Sistema de origem", value: indicator.source },
];

function IndicatorSheet({ indicator, onClose }) {
  useEffect(() => {
    if (!indicator) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [indicator, onClose]);

  if (!indicator) {
    return null;
  }

  const status = STATUS_STYLES[indicator.status] ?? STATUS_STYLES.stable;
  const sections = [
    { label: "Definição e propósito", value: indicator.definition },
    { label: "Fórmula de cálculo", value: indicator.formula, mono: true },
    { label: "Frequência de mensuração", value: indicator.frequency },
    { label: "Fonte e granularidade", value: `${indicator.source} — município/unidade/equipe` },
    { label: "Estratificações e limitações", value: indicator.limitations, warn: true },
  ];

  return (
    <div className="sheet-overlay" onClick={onClose} role="presentation">
      <div
        className="sheet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-modal__header">
          <div>
            <p className="sheet-modal__kicker">Ficha Técnica do Indicador</p>
            <h2 id="sheet-title">{indicator.name}</h2>
          </div>
          <button type="button" className="sheet-modal__close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="sheet-modal__body">
          <div className="sheet-modal__stats">
            <div className="sheet-stat">
              <p>Valor atual</p>
              <strong>
                {indicator.value} {indicator.unit}
              </strong>
            </div>
            <div className="sheet-stat">
              <p>Parâmetro / Meta</p>
              <strong style={{ color: status.color }}>{indicator.parameter}</strong>
            </div>
            <div className="sheet-stat">
              <p>Situação</p>
              <StatusBadge status={indicator.status} label={STATUS_DESCRIPTIONS[indicator.status]} />
            </div>
          </div>

          {sections.map((section) => (
            <section key={section.label} className="sheet-section">
              <p className="sheet-section__label">{section.label}</p>
              <p className={`sheet-section__value ${section.mono ? "is-mono" : ""} ${section.warn ? "is-warn" : ""}`}>
                {section.value}
              </p>
            </section>
          ))}

          <section className="sheet-trace">
            <p className="sheet-section__label">Rastreabilidade do dado</p>
            <div className="sheet-trace__grid">
              {TRACEABILITY(indicator).map((item) => (
                <div key={item.label} className="sheet-trace__item">
                  <span className="sheet-trace__dot" style={{ backgroundColor: item.color }} />
                  <span>{item.label}:</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default IndicatorSheet;
