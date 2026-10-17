import { useState } from "react";

import { MaternoResultsProvider } from "./contexts/MaternoResultsContext";
import { useMaternoResults } from "./hooks/useMaternoResults";
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
import Login from "./pages/Login/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

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

function AuthenticatedApp() {
  const { session, loading } = useAuth();
  const { indicators: maternoIndicators } = useMaternoResults();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("Visão Geral");
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", color: "#0f2744", fontFamily: "sans-serif" }}>
        Carregando painel SEMUSA...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const maternoActive = activePage === "Materno-Infantil";
  const maternoPeriods = [...new Set(maternoIndicators.filter(item => item.period !== "Sem dados").map(item => item.period))];
  const maternoUpdatedAt = maternoIndicators.map(item => item.updatedAt).filter(Boolean).sort().slice(-1)[0];
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
          {...(maternoActive ? {
            period: maternoPeriods.length === 1 ? maternoPeriods[0] : maternoPeriods.length ? "Por indicador" : "Sem dados",
            updatedAt: maternoUpdatedAt ? new Date(maternoUpdatedAt).toLocaleDateString("pt-BR") : "Sem dados",
            locationUnavailable: true,
            locations: ["Sem recorte por local"],
            location: "Sem recorte por local",
          } : {})}
        />

        <main className="content-body">
          {renderPage(activePage, setActivePage, setSelectedIndicator)}
        </main>
      </div>

      <IndicatorSheet
        indicator={selectedIndicator?.line === "Materno-Infantil" ? maternoIndicators.find(item => item.id === selectedIndicator.id) ?? null : selectedIndicator}
        onClose={() => setSelectedIndicator(null)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MaternoResultsProvider>
        <AuthenticatedApp />
      </MaternoResultsProvider>
    </AuthProvider>
  );
}

export default App;
