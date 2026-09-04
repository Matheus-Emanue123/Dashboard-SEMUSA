import { Fragment } from "react";

function JourneyStrip({
  steps,
  numbered = false,
  arrow = "›",
  activeStep = "all",
  onSelectStep,
  stageCounts,
}) {
  return (
    <div className={`journey-strip ${numbered ? "is-numbered" : ""}`}>
      {steps.map((step, index) => {
        const isActive = activeStep === step.label;
        const count = stageCounts?.[step.label];
        const CardTag = onSelectStep ? "button" : "div";

        return (
          <Fragment key={step.label}>
            <CardTag
              type={onSelectStep ? "button" : undefined}
              className={`journey-card ${numbered ? "is-numbered" : ""} ${isActive ? "is-active" : ""}`}
              aria-pressed={onSelectStep ? isActive : undefined}
              aria-label={
                typeof count === "number"
                  ? `${step.label}, ${count} indicadores`
                  : step.label
              }
              onClick={onSelectStep ? () => onSelectStep(step.label) : undefined}
            >
              {numbered ? (
                <div className="journey-card__number" style={{ backgroundColor: step.color }}>
                  {step.n}
                </div>
              ) : null}

              <div
                className="journey-card__body"
                style={{
                  borderColor: isActive ? step.color : `${step.color}50`,
                  borderTopColor: step.color,
                  color: step.color,
                }}
              >
                <p className="journey-card__title" style={{ color: step.color }}>
                  <span>{step.label}</span>
                  {typeof count === "number" ? (
                    <span className="journey-card__count" style={{ backgroundColor: step.color }}>
                      {count}
                    </span>
                  ) : null}
                </p>
                <ul>
                  {step.items.map((item) => (
                    <li key={item}>
                      <span style={{ color: step.color }}>●</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardTag>

            {index < steps.length - 1 ? (
              <span
                className="journey-strip__arrow"
                style={{ color: numbered ? "#d0dcea" : "#2bbac2" }}
              >
                {arrow}
              </span>
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}

export default JourneyStrip;
