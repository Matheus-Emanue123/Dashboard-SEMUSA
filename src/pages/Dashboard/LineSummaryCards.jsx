import { LINE_SUMMARY_CARDS } from "../../data/overviewDashboard";

function LineSummaryCards() {
  return (
    <section className="line-summary" aria-labelledby="line-summary-title">
      <p id="line-summary-title" className="line-summary__kicker">
        Resumo das linhas de cuidado
      </p>

      <div className="line-summary__grid">
        {LINE_SUMMARY_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            className="line-summary-card"
            style={{
              backgroundColor: card.background,
              borderColor: `${card.color}40`,
              borderTopColor: card.color,
            }}
          >
            <span className="line-summary-card__label" style={{ color: card.color }}>
              {card.label}
            </span>

            {card.count === null ? (
              <span className="line-summary-card__pending" style={{ color: card.color }}>
                A DEFINIR
              </span>
            ) : (
              <>
                <span className="line-summary-card__count" style={{ color: card.color }}>
                  {card.count}
                </span>
                <span className="line-summary-card__unit">indicadores</span>
              </>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

export default LineSummaryCards;
