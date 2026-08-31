import { useState } from "react";

import Sidebar from "./components/Sidebar/sidebar";
import Header from "./components/Header/header";
import Dashboard from "./pages/Dashboard/Dashboard";

import "./App.css";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className={`main-wrapper ${isCollapsed ? "collapsed" : ""}`}>
        <Header />

        <main className="content-body">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
