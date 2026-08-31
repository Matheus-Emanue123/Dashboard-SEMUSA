import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

import SectionHeading from "../Dashboard/SectionHeading";
import IndicatorBrowser from "../../components/IndicatorBrowser/IndicatorBrowser";
import { ODS_PANELS, ODS_SCORES } from "../../services/linePages";
import { ODS_CATALOG_INDICATORS } from "../../services/catalogIndicators";
import { LINE_ODS } from "../../services/indicatorStages";

function Ods({ onOpenSheet }) {
  const [stage, setStage] = useState("all");

  return (
    <div className="line-page">
      <article className="dashboard-panel">
        <SectionHeading
          title="Ações em saúde alinhadas aos ODS"
          subtitle="8 indicadores ilustrativos — ODS 2, 3, 10 e 17"
        />
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ODS_SCORES} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
              <XAxis dataKey="ods" tick={{ fontSize: 12, fill: "#5a7080" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#5a7080" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${value} pts`} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #d0dcea" }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="score" name="Score atual" radius={[4, 4, 0, 0]}>
                {ODS_SCORES.map((item) => {
                  const panel = ODS_PANELS.find((entry) => entry.ods === item.ods);
                  return <Cell key={item.ods} fill={panel?.cor ?? "#6b7280"} />;
                })}
              </Bar>
              <Bar dataKey="meta" name="Meta" fill="#6b7280" fillOpacity={0.2} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <IndicatorBrowser
        line={LINE_ODS}
        indicators={ODS_CATALOG_INDICATORS}
        stage={stage}
        onStageChange={setStage}
        onOpen={onOpenSheet}
        title="Indicadores por ODS"
        allGroupsLabel="Todos os ODS"
        hint="Filtre por objetivo. Os valores são ilustrativos até a validação com a SEMUSA."
      />

      <div className="ods-note">
        <span>i</span>
        <div>
          <p>Valores ilustrativos</p>
          <small>
            O conjunto final de ODS ainda pode crescer na validação com a SEMUSA. A lista abaixo já
            segue o mesmo padrão de navegação das demais linhas.
          </small>
        </div>
      </div>
    </div>
  );
}

export default Ods;
