import { useState } from "react";
import { SENHA_MINIMA } from "../../pages/AdminUsuarios/constants";
import { changeInitialPassword } from "../../services/adminUsersApi";
import "../../pages/Login/Login.css";

const LOCK_PATH =
  "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z";

function CampoSenha({ id, label, value, onChange, disabled, mostrar, onToggle, autoFocus }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrapper">
        <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d={LOCK_PATH} clipRule="evenodd" />
        </svg>
        <input
          id={id}
          type={mostrar ? "text" : "password"}
          autoComplete="new-password"
          autoFocus={autoFocus}
          placeholder="••••••••••"
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <button
          type="button"
          className="toggle-password-btn"
          onClick={onToggle}
          title={mostrar ? "Ocultar senha" : "Ver senha"}
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// tela do primeiro acesso, no mesmo estilo do login: não tem como sair dela sem definir a senha
export default function TrocaSenhaInicial({ onConcluido }) {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErro("");

    if (senha.length < SENHA_MINIMA) {
      setErro(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }

    setEnviando(true);
    try {
      await changeInitialPassword(senha);
      onConcluido();
    } catch (err) {
      setErro(err.message || "Não foi possível trocar a senha.");
      setEnviando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Defina a sua senha</h1>
          <p className="login-subtitle">
            Este é o seu primeiro acesso. Troque a senha temporária para continuar.
          </p>
        </div>

        {erro && (
          <div className="login-alert" role="alert">
            <svg className="login-alert-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={submit} className="login-form">
          <CampoSenha
            id="nova-senha"
            label="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={enviando}
            mostrar={mostrar}
            onToggle={() => setMostrar(!mostrar)}
            autoFocus
          />
          <CampoSenha
            id="confirmar-senha"
            label="Confirmar nova senha"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            disabled={enviando}
            mostrar={mostrar}
            onToggle={() => setMostrar(!mostrar)}
          />

          <button
            type="submit"
            className="login-submit-btn"
            disabled={enviando || !senha || !confirmacao}
          >
            {enviando ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Salvando...
              </span>
            ) : (
              "Salvar nova senha"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Mínimo de {SENHA_MINIMA} caracteres. Dados protegidos e monitorados em conformidade com
            a <strong>LGPD (Lei nº 13.709/2018)</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
