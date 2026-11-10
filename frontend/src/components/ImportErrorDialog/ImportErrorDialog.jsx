import { useEffect, useRef, useState } from "react";
import { formatRowErrors } from "../../services/importError";
import "./ImportErrorDialog.css";

// Pop-up modal para falhas na importação da planilha. Usa <dialog> nativo: showModal()
// já prende o foco dentro do pop-up, escurece o fundo e fecha com Esc.
function ImportErrorDialog({ details, fileName, onClose, onRetry }) {
  const dialogRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    // Sem close() no cleanup: no StrictMode ele dispararia onClose e desmontaria o pop-up.
    // Ao sair do DOM, o <dialog> deixa a camada modal sozinho.
    if (dialog && !dialog.open) {
      dialog.showModal();
      // showModal() põe o foco no primeiro botão (o X); leva para a ação principal.
      dialog.querySelector("[data-autofocus]")?.focus();
    }
  }, []);

  const copyRows = async () => {
    try {
      await navigator.clipboard.writeText(formatRowErrors(details.rows));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const retry = () => {
    dialogRef.current?.close();
    onRetry();
  };

  return (
    <dialog
      ref={dialogRef}
      className="import-error"
      aria-labelledby="import-error-title"
      aria-describedby="import-error-subtitle"
      onClose={onClose}
      onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close(); }}
    >
      <div className="import-error__bar" />
      <header className="import-error__header">
        <div className="import-error__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
            <path d="M12 11v3M12 17h.01" />
          </svg>
        </div>
        <div className="import-error__heading">
          <h2 id="import-error-title" className="import-error__title">{details.title}</h2>
          {details.subtitle && <p id="import-error-subtitle" className="import-error__subtitle">{details.subtitle}</p>}
        </div>
        <button type="button" className="import-error__close" aria-label="Fechar" onClick={() => dialogRef.current?.close()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="import-error__body">
        {fileName && (
          <div className="import-error__file" title={fileName}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zM8 11h8M8 15h8M12 11v8" />
            </svg>
            <span>{fileName}</span>
          </div>
        )}

        <p className="import-error__label">O que encontramos</p>
        <p className="import-error__found">
          {details.found}
          {details.sheet && <> <code className="import-error__code">{details.sheet}</code>:</>}
        </p>

        {details.missingColumns?.length > 0 && (
          <ul className="import-error__tags">
            {details.missingColumns.map(column => (
              <li key={column}><code className="import-error__code import-error__code--missing">{column}</code></li>
            ))}
          </ul>
        )}

        {details.sheets && (
          <ul className="import-error__sheets">
            {details.sheets.map(sheet => (
              <li key={sheet.name} className={sheet.ok ? "is-ok" : "is-missing"}>
                <span className="import-error__mark" aria-hidden="true">{sheet.ok ? "✓" : "✕"}</span>
                <code className={`import-error__code${sheet.ok ? "" : " import-error__code--missing"}`}>{sheet.name}</code>
                <span className="import-error__hint">{sheet.ok ? "encontrada" : "não encontrada"}</span>
              </li>
            ))}
          </ul>
        )}

        {details.rows?.length > 0 && (
          <ul className="import-error__rows">
            {details.rows.map((row, index) => (
              <li key={`${row.linha}-${index}`}>
                <code className="import-error__code">Linha {row.linha}</code>
                <span>{row.motivo}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="import-error__label">Como corrigir</p>
        <p className="import-error__fix">{details.fix}</p>
      </div>

      <footer className="import-error__footer">
        {details.rows?.length > 0 && (
          <button type="button" className="import-error__btn" onClick={copyRows} aria-live="polite">
            {copied ? "Lista copiada" : "Copiar lista"}
          </button>
        )}
        <button
          type="button"
          className={`import-error__btn${details.canRetry ? "" : " import-error__btn--primary"}`}
          onClick={() => dialogRef.current?.close()}
          data-autofocus={details.canRetry ? undefined : true}
        >
          Fechar
        </button>
        {details.canRetry && (
          <button type="button" className="import-error__btn import-error__btn--primary" onClick={retry} data-autofocus>
            Escolher outra planilha
          </button>
        )}
      </footer>
    </dialog>
  );
}

export default ImportErrorDialog;
