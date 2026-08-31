import LineSummaryCards from "./LineSummaryCards";
import CoverageChart from "./CoverageChart";
import AttentionList from "./AttentionList";
import LineStatusBars from "./LineStatusBars";
import QualityNotices from "./QualityNotices";

import "./Dashboard.css";

function Dashboard({ onSelectLine }) {
  return (
    <div className="dashboard">
      <LineSummaryCards onSelectLine={onSelectLine} />

      <div className="dashboard__row dashboard__row--chart">
        <CoverageChart />
        <AttentionList />
      </div>

      <div className="dashboard__row dashboard__row--status">
        <LineStatusBars />
        <QualityNotices />
      </div>
    </div>
  );
}

export default Dashboard;
