import { useState } from "react";

import Sidebar from "./components/Sidebar/sidebar";
import Header from "./components/Header/header";

import "./App.css";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="app-container">

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Área à direita da Sidebar */}
      <div className={`main-wrapper ${isCollapsed ? "collapsed" : ""}`}>

        {/* Header */}
        <Header />

        {/* Conteúdo principal */}
        <main className="content-body">
        </main>

      </div>

    </div>
  );
}

export default App;
