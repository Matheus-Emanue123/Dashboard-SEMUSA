import { useState } from "react";
import { STATUS_DESCRIPTIONS, STATUS_STYLES } from "../../services/overviewDashboard";
import { useAuth } from "../../contexts/AuthContext";
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

function Sidebar({ isCollapsed, setIsCollapsed, activeItem: activeItemProp, onSelectItem }) {
  const { user, role, logout } = useAuth();
  const [internalActive, setInternalActive] = useState("Catálogo");
  const activeItem = activeItemProp ?? internalActive;

  const selectItem = (itemId) => {
    if (onSelectItem) {
      onSelectItem(itemId);
      return;
    }

    setInternalActive(itemId);
  };

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
    // só o ADMIN vê; a barreira de verdade está no backend (@Roles('ADMIN'))
    ...(role === "ADMIN"
      ? [
          {
            id: "Administração de Acessos",
            label: "Administração de Acessos",
            type: "svg",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            ),
          },
        ]
      : []),
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
                onClick={() => selectItem(item.id)}
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
              {Object.entries(STATUS_STYLES).map(([key, style]) => (
                <li className="legend-item" key={key}>
                  <span
                    className="legend-badge"
                    style={{ color: style.color, backgroundColor: style.background }}
                  >
                    {style.symbol}
                  </span>
                  <span>{STATUS_DESCRIPTIONS[key]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Perfil do Usuário e Botão Sair */}
        {user && (
          <div className={`sidebar-user ${isCollapsed ? "collapsed" : ""}`}>
            {!isCollapsed ? (
              <>
                <div className="user-info">
                  <div className="user-avatar">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="user-details">
                    <span className="user-email" title={user.email}>
                      {user.email}
                    </span>
                    <span className="user-role-badge">
                      {role || "VISUALIZADOR"}
                    </span>
                  </div>
                </div>
                <button
                  className="user-logout-btn"
                  onClick={logout}
                  title="Encerrar sessão"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <button
                className="user-logout-btn collapsed"
                onClick={logout}
                title={`Logado como: ${user.email} (${role}) · Clique para sair`}
                type="button"
              >
                <div className="user-avatar compact">
                  {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
              </button>
            )}
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