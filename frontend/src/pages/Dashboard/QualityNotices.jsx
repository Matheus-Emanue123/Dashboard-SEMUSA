//OK
import { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
//import { ACTIVE_SOURCES, QUALITY_NOTICES } from "../../services/overviewDashboard";
import SectionHeading from "./SectionHeading";

function QualityNotices() {

  const [notices, setNotices] = useState([]);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    apiGet("fontes-ativas")
      .then(setSources)
      .catch((err) => console.error("Erro ao carregar fontes ativas:", err));
  }, []);

  useEffect(() => {
    apiGet("avisos-qualidade")
      .then(setNotices)
      .catch((err) => console.error("Erro ao carregar avisos de qualidade:", err));
  }, []);
  
  return (
    <article className="dashboard-panel">
      <SectionHeading
        title="Avisos de qualidade e atraso"
        subtitle="Origem · Referência · Limitação"
      />

      <div className="quality-notices">
        {notices.map((notice) => (
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
            {sources.map((source) => (
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
