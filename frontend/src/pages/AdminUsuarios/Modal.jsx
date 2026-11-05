import "./AdminUsuarios.css";

// casca comum dos modais; quem fecha (ou não) é o conteúdo
export default function Modal({ title, subtitle, children }) {
  return (
    <div className="admin-modal__backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="admin-modal">
        <h2>{title}</h2>
        {subtitle && <p className="admin-modal__sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
