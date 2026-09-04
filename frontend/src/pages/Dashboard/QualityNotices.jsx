import { ACTIVE_SOURCES, QUALITY_NOTICES } from "../../services/overviewDashboard";
import SectionHeading from "./SectionHeading";

function QualityNotices() {
  return (
    <article className="dashboard-panel">
      <SectionHeading
        title="Avisos de qualidade e atraso"
        subtitle="Origem · Referência · Limitação"
      />

      <div className="quality-notices">
        {QUALITY_NOTICES.map((notice) => (
          <div key={notice} className="quality-notice">
            <span className="quality-notice__badge" aria-hidden="true">
              !
            </span>
            <p>{notice}</p>
          </div>
        ))}

        <div className="quality-sources">
          <p className="quality-sources__title">Fontes ativas</p>
          <div className="quality-sources__tags">
            {ACTIVE_SOURCES.map((source) => (
              <span key={source} className="quality-sources__tag">
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default QualityNotices;
