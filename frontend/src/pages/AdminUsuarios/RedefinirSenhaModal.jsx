import { useState } from "react";
import Modal from "./Modal";
import { SENHA_MINIMA } from "./constants";
import { resetPassword } from "../../services/adminUsersApi";

export default function RedefinirSenhaModal({ usuario, onClose, onDone }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErro("");

    if (senha.length < SENHA_MINIMA) {
      setErro(`A senha temporária precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }

    setEnviando(true);
    try {
      await resetPassword(usuario.id, senha);
      onDone(`Senha de ${usuario.email} redefinida. Ele deverá trocá-la no próximo acesso.`);
    } catch (err) {
      setErro(err.message || "Não foi possível redefinir a senha.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal title="Redefinir senha" subtitle={`${usuario.nome} · ${usuario.email}`}>
      <form onSubmit={submit}>
        <label className="admin-modal__field">
          Nova senha temporária
          <input
            className="admin-users__input"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>

        {erro && <p className="admin-users__feedback admin-users__feedback--erro">{erro}</p>}

        <div className="admin-modal__footer">
          <button
            type="button"
            className="admin-users__btn admin-users__btn--ghost"
            onClick={onClose}
            disabled={enviando}
          >
            Cancelar
          </button>
          <button type="submit" className="admin-users__btn" disabled={enviando}>
            {enviando ? "Salvando..." : "Redefinir"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
