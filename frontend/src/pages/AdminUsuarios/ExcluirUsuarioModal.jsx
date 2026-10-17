import { useState } from "react";
import Modal from "./Modal";
import { deleteUser } from "../../services/adminUsersApi";

// exclusão definitiva: o admin precisa digitar o e-mail da conta para liberar o botão
export default function ExcluirUsuarioModal({ usuario, onClose, onDone }) {
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const liberado = confirmacao.trim().toLowerCase() === usuario.email.toLowerCase();

  const submit = async (e) => {
    e.preventDefault();
    if (!liberado) return;

    setErro("");
    setEnviando(true);
    try {
      await deleteUser(usuario.id);
      onDone(`Conta de ${usuario.email} excluída.`);
    } catch (err) {
      setErro(err.message || "Não foi possível excluir a conta.");
      setEnviando(false);
    }
  };

  return (
    <Modal title="Excluir conta" subtitle={`${usuario.nome} · ${usuario.email}`}>
      <form onSubmit={submit}>
        <p className="admin-users__feedback admin-users__feedback--erro">
          A exclusão é definitiva: a conta não pode ser recuperada, só criada de novo. O histórico
          de acessos e as ações já registradas continuam guardados. Para só impedir o acesso,
          use "Bloquear".
        </p>
        <label className="admin-modal__field">
          Digite o e-mail da conta para confirmar
          <input
            className="admin-users__input"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            placeholder={usuario.email}
            autoComplete="off"
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
          <button
            type="submit"
            className="admin-users__btn admin-users__btn--danger"
            disabled={!liberado || enviando}
          >
            {enviando ? "Excluindo..." : "Excluir definitivamente"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
