import IndicatorCard from "../IndicatorCard/IndicatorCard";

function IndicatorGrid({ title = "Indicadores priorizados", indicators, onOpen }) {
  return (
    <section>
      <p className="line-kicker">{title}</p>
      <div className="indicator-grid">
        {indicators.map((indicator) => (
          <IndicatorCard key={indicator.id} indicator={indicator} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

export default IndicatorGrid;
