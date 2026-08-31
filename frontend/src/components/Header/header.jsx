import "./header.css";

function Header({
  title = "Visão Geral",
  subtitle = "Resumo consolidado de todas as linhas de cuidado",
  locations = ["Município de Divinópolis"],
  location = "Município de Divinópolis",
  onLocationChange,
}) {
  return (
    <header className="main-header">
      <div className="header-left">
        <div className="title-indicator"></div>
        <div className="header-title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        <div className="select-container">
          <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <select
            className="filter-select"
            value={location}
            onChange={(event) => onLocationChange?.(event.target.value)}
          >
            {locations.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="header-info">
          <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Período: <strong>Jan/2025</strong></span>
        </div>

        <div className="header-info">
          <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Atualizado: <strong>10/02/2025</strong></span>
        </div>
      </div>
    </header>
  );
}

export default Header;