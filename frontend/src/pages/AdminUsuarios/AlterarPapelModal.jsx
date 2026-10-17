import { useState } from "react";
import Modal from "./Modal";
import { ROLE_OPTIONS } from "./constants";
import { changeRole } from "../../services/adminUsersApi";

export default function AlterarPapelModal({ usuario, onClose, onDone }) {
  const [role, setRole] = useState(usuario.role);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await changeRole(usuario.id, { role });
      onDone(`Papel de ${usuario.email} alterado para ${role}. Vale a partir do próximo login dele.`);
    } catch (err) {
      setErro(err.message || "Não foi possível alterar o papel.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal title="Alterar papel" subtitle={`${usuario.nome} · ${usuario.email}`}>
      <form onSubmit={submit}>
        <label className="admin-modal__field">
          Papel
          <select
            className="admin-users__select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
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
            className="admin-users__btn"
            disabled={enviando || role === usuario.role}
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
