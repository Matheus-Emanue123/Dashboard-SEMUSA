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
import Login from "./pages/Login/Login";
import AdminUsuarios from "./pages/AdminUsuarios/AdminUsuarios";
import TrocaSenhaInicial from "./components/TrocaSenhaInicial/TrocaSenhaInicial";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useDeveTrocarSenha } from "./hooks/useDeveTrocarSenha";

import { LOCATION_OPTIONS, PAGE_META } from "./services/overviewDashboard";

import "./App.css";
import "./pages/Dashboard/Dashboard.css";
import "./pages/linePages.css";
import "./pages/AdminUsuarios/AdminUsuarios.css";

function renderPage(page, onSelectLine, onOpenSheet, isAdmin) {
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
    case "Administração de Acessos":
      return isAdmin ? <AdminUsuarios /> : <Dashboard onSelectLine={onSelectLine} />;
    default:
      return <Dashboard onSelectLine={onSelectLine} />;
  }
}

function AuthenticatedApp() {
  const { session, loading, role, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("Visão Geral");
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const troca = useDeveTrocarSenha(session?.user?.id);

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

  // primeiro acesso (ou senha redefinida pelo TI): só o popup de troca de senha aparece
  if (troca.loading) {
    return null;
  }
  if (troca.erro) {
    return (
      <div style={{ display: "flex", height: "100vh", flexDirection: "column", gap: 16, alignItems: "center", justifyContent: "center", color: "#0f2744", fontFamily: "sans-serif", textAlign: "center", padding: 24 }}>
        <p style={{ margin: 0 }}>Não foi possível verificar a sua conta. Confira a conexão e tente de novo.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="admin-users__btn" onClick={troca.refetch}>
            Tentar de novo
          </button>
          <button type="button" className="admin-users__btn admin-users__btn--ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </div>
    );
  }
  if (troca.deveTrocar) {
    return <TrocaSenhaInicial onConcluido={troca.refetch} />;
  }

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
          {renderPage(activePage, setActivePage, setSelectedIndicator, role === "ADMIN")}
        </main>
      </div>

      <IndicatorSheet
        indicator={selectedIndicator}
        onClose={() => setSelectedIndicator(null)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
