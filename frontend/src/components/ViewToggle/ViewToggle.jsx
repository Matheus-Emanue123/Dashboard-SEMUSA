const OPTIONS = [
  {
    id: "grid",
    label: "Grid",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M2 2h5.2v5.2H2zm6.8 0H14v5.2H8.8zM2 8.8h5.2V14H2zm6.8 0H14V14H8.8z" />
      </svg>
    ),
  },
  {
    id: "list",
    label: "Lista",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M2 3h12v1.5H2zm0 4.25h12V8.8H2zM2 11.5h12V13H2z" />
      </svg>
    ),
  },
];

function ViewToggle({ view, onChange }) {
  return (
    <div className="view-toggle" role="group" aria-label="Modo de visualização">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`view-toggle__btn ${view === option.id ? "is-active" : ""}`}
          aria-pressed={view === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default ViewToggle;
