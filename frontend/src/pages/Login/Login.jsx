import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import logoSemusa from '../../assets/images/logo.png';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      console.error('Erro ao efetuar login:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else {
        setErrorMsg(err.message || 'Falha ao autenticar. Verifique sua conexão.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow login-bg-glow-1" aria-hidden="true" />
      <div className="login-bg-glow login-bg-glow-2" aria-hidden="true" />
      <div className="login-bg-glow login-bg-glow-3" aria-hidden="true" />
      <div className="login-grid-pattern" aria-hidden="true" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-container">
            <img src={logoSemusa} alt="SEMUSA Divinópolis" className="login-logo-img" />
          </div>
          <span className="login-tag">Secretaria Municipal de Saúde</span>
          <h1 className="login-title">Painel de Indicadores</h1>
          <p className="login-subtitle">
            Acesso restrito e seguro para servidores e gestores municipais
          </p>
        </div>

        {errorMsg && (
          <div className="login-alert" role="alert">
            <svg className="login-alert-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail Institucional</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <input
                id="email"
                type="email"
                required
                autoFocus
                placeholder="nome@semusa.gov.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha de Acesso</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Autenticando...
              </span>
            ) : (
              'Acessar Painel'
            )}
          </button>
        </form>

        <div className="help-collapse-container">
          <button
            type="button"
            className={`help-collapse-trigger ${isHelpOpen ? 'open' : ''}`}
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            aria-expanded={isHelpOpen}
          >
            <div className="help-trigger-left">
              <svg className="help-icon" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Não sabe como entrar ou precisa de acesso?</span>
            </div>
            <svg
              className={`chevron-icon ${isHelpOpen ? 'rotated' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isHelpOpen && (
            <div className="help-collapse-content">
              <div className="help-block">
                <h4>Primeiro acesso ao painel?</h4>
                <p>
                  O acesso é exclusivo para servidores municipais autorizados. Para cadastrar seu e-mail institucional e receber sua senha de acesso, solicite a autorização da chefia imediata da sua unidade.
                </p>
              </div>

              <div className="help-block">
                <h4>Com quem falar para solicitar acesso ou redefinir senha?</h4>
                <p>
                  • <strong>Diretoria de Vigilância em Saúde:</strong> Para liberação de acesso e autorização de novos usuários.<br />
                  • <strong>Suporte de TI da SEMUSA:</strong> Para redefinição de senhas expiradas ou problemas técnicos de conexão.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="login-footer">
          <p>
            Dados protegidos e monitorados em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
