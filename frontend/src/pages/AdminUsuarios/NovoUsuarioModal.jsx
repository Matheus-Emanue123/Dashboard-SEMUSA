import { useState } from "react";
import Modal from "./Modal";
import { createUser } from "../../services/adminUsersApi";
import { ROLE_OPTIONS, SENHA_MINIMA, UNIDADE_HABILITADA } from "./constants";

export default function NovoUsuarioModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    role: "VISUALIZADOR_UNIDADE",
    senha: "",
    unidade_saude: "",
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim() || !form.email.trim()) {
      setErro("Preencha o nome e o e-mail.");
      return;
    }
    if (form.senha.length < SENHA_MINIMA) {
      setErro(`A senha temporária precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }

    const corpo = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      role: form.role,
      senha: form.senha,
    };
    if (UNIDADE_HABILITADA && form.unidade_saude.trim()) {
      corpo.unidade_saude = form.unidade_saude.trim();
    }

    setEnviando(true);
    try {
      await createUser(corpo);
      onCreated();
    } catch (err) {
      setErro(err.message || "Não foi possível cadastrar o usuário.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      title="Cadastrar novo usuário"
      subtitle="O servidor deverá trocar a senha temporária no primeiro acesso."
    >
      <form onSubmit={submit}>
        <label className="admin-modal__field">
          Nome completo
          <input className="admin-users__input" value={form.nome} onChange={set("nome")} />
        </label>
        <label className="admin-modal__field">
          E-mail institucional
          <input
            className="admin-users__input"
            type="email"
            value={form.email}
            onChange={set("email")}
          />
        </label>
        <label className="admin-modal__field">
          Papel
          <select className="admin-users__select" value={form.role} onChange={set("role")}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        {UNIDADE_HABILITADA && (
          <label className="admin-modal__field">
            Unidade de saúde (opcional)
            <input
              className="admin-users__input"
              value={form.unidade_saude}
              onChange={set("unidade_saude")}
            />
          </label>
        )}
        <label className="admin-modal__field">
          Senha temporária
          <input
            className="admin-users__input"
            type="password"
            autoComplete="new-password"
            value={form.senha}
            onChange={set("senha")}
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
            {enviando ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
