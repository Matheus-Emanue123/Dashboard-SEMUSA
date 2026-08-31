import { useState } from "react";

import Sidebar from "./components/Sidebar/sidebar";
import Header from "./components/Header/header";
import IndicatorSheet from "./components/IndicatorSheet/IndicatorSheet";
import Dashboard from "./pages/Dashboard/Dashboard";
import MaternoInfantil from "./pages/MaternoInfantil/MaternoInfantil";
import CancerColorretal from "./pages/CancerColorretal/CancerColorretal";
import NavegacaoCuidado from "./pages/NavegacaoCuidado/NavegacaoCuidado";
import ConexaoColaborativa from "./pages/ConexaoColaborativa/ConexaoColaborativa";
import Ods from "./pages/Ods/Ods";
import Catalogo from "./pages/Catalogo/Catalogo";

import { LOCATION_OPTIONS, PAGE_META } from "./services/overviewDashboard";

import "./App.css";
import "./pages/Dashboard/Dashboard.css";
import "./pages/linePages.css";

function renderPage(page, onSelectLine, onOpenSheet) {
  switch (page) {
    case "Materno-Infantil":
      return <MaternoInfantil onOpenSheet={onOpenSheet} />;
    case "Câncer Colorretal":
      return <CancerColorretal onOpenSheet={onOpenSheet} />;
    case "Navegação do Cuidado":
      return <NavegacaoCuidado onOpenSheet={onOpenSheet} />;
    case "Conexão Colaborativa":
      return <ConexaoColaborativa onOpenSheet={onOpenSheet} />;
    case "ODS":
      return <Ods onOpenSheet={onOpenSheet} />;
    case "Catálogo":
      return <Catalogo onOpenSheet={onOpenSheet} />;
    default:
      return <Dashboard onSelectLine={onSelectLine} />;
  }
}

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("Visão Geral");
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  const meta = PAGE_META[activePage] ?? PAGE_META["Visão Geral"];

  return (
    <div className="app-container">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeItem={activePage}
        onSelectItem={setActivePage}
      />

      <div className={`main-wrapper ${isCollapsed ? "collapsed" : ""}`}>
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          locations={LOCATION_OPTIONS}
          location={location}
          onLocationChange={setLocation}
        />

        <main className="content-body">
          {renderPage(activePage, setActivePage, setSelectedIndicator)}
        </main>
      </div>

      <IndicatorSheet
        indicator={selectedIndicator}
        onClose={() => setSelectedIndicator(null)}
      />
    </div>
  );
}

export default App;
