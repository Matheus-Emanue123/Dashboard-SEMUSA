import { useState } from "react";
import "./sidebar.css";

// Importações dos ícones (.svg)
import gridIcon from "../../assets/icons/grip.svg";
import heartIcon from "../../assets/icons/heart.svg";
import targetIcon from "../../assets/icons/target.svg";
import repeatIcon from "../../assets/icons/repeat.svg";
import globeIcon from "../../assets/icons/globe.svg";
import listIcon from "../../assets/icons/list.svg";
import arrowLeftIcon from "../../assets/icons/chevron-left.svg";
import logoSemusa from "../../assets/images/logo.png";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const [activeItem, setActiveItem] = useState("Catálogo");

  const menuItems = [
    { id: "Visão Geral", label: "Visão Geral", type: "img", icon: gridIcon },
    { id: "Materno-Infantil", label: "Materno-Infantil", type: "img", icon: heartIcon },
    { id: "Câncer Colorretal", label: "Câncer Colorretal", type: "img", icon: targetIcon },
    { id: "Navegação do Cuidado", label: "Navegação do Cuidado", type: "img", icon: repeatIcon },
    {
      id: "Conexão Colaborativa",
      label: "Conexão Colaborativa",
      type: "svg",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 12 12 22 22 12 12 2" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    { id: "ODS", label: "ODS", type: "img", icon: globeIcon },
    { id: "Catálogo", label: "Catálogo", type: "img", icon: listIcon },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className={`sidebar-logo ${isCollapsed ? "collapsed" : ""}`}>
          <img
            src={logoSemusa}
            alt="SEMUSA Divinópolis"
            className="sidebar-logo-img"
          />
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveItem(item.id)}
                title={isCollapsed ? item.label : ""}
              >
                {/* A faixa azul lateral agora é renderizada independente do menu estar recolhido ou expandido */}
                {isActive && <div className="active-bar"></div>}

                {item.type === "svg" ? (
                  <span className="sidebar-icon">{item.icon}</span>
                ) : (
                  <img src={item.icon} alt={item.label} className="sidebar-icon-img" />
                )}

                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        {!isCollapsed && (
          <div className="sidebar-legend">
            <span className="legend-title">LEGENDA</span>
            <ul className="legend-list">
              <li className="legend-item success">
                <span className="legend-badge">✓</span>
                <span>Dentro do parâmetro</span>
              </li>
              <li className="legend-item warning">
                <span className="legend-badge">!</span>
                <span>Fora do parâmetro</span>
              </li>
              <li className="legend-item info">
                <span className="legend-badge">↑</span>
                <span>Tendência de melhora</span>
              </li>
              <li className="legend-item neutral">
                <span className="legend-badge">=</span>
                <span>Estável</span>
              </li>
              <li className="legend-item danger">
                <span className="legend-badge">↓</span>
                <span>Tendência de piora</span>
              </li>
            </ul>
          </div>
        )}

        <button
          className="toggle-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <img
            src={arrowLeftIcon}
            alt="Toggle"
            className={`toggle-icon ${isCollapsed ? "collapsed" : ""}`}
          />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;