import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { changeStatus, listUsers } from "../../services/adminUsersApi";
import AlterarPapelModal from "./AlterarPapelModal";
import ExcluirUsuarioModal from "./ExcluirUsuarioModal";
import NovoUsuarioModal from "./NovoUsuarioModal";
import { ROLE_OPTIONS } from "./constants";
import RedefinirSenhaModal from "./RedefinirSenhaModal";
import "./AdminUsuarios.css";

const PAGE_SIZE = 20;

export default function AdminUsuarios() {
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [dados, setDados] = useState({ itens: [], total: 0 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [modal, setModal] = useState(null); // { tipo: 'novo' | 'senha' | 'papel' | 'excluir', usuario? }
  const [atualizandoId, setAtualizandoId] = useState(null);

  // espera o usuário parar de digitar antes de consultar a API
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [busca]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setDados(await listUsers({ page, pageSize: PAGE_SIZE, busca: buscaAplicada, role }));
    } catch (err) {
      setErro(err.message || "Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }, [page, buscaAplicada, role]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const fecharComSucesso = (mensagem) => {
    setModal(null);
    setSucesso(mensagem);
    carregar();
  };

  const alternarStatus = async (u) => {
    setSucesso("");
    setErro("");
    setAtualizandoId(u.id);
    try {
      await changeStatus(u.id, !u.ativo);
      setSucesso(`Conta de ${u.email} ${u.ativo ? "bloqueada" : "reativada"}.`);
      await carregar();
    } catch (err) {
      setErro(err.message || "Não foi possível alterar o status da conta.");
    } finally {
      setAtualizandoId(null);
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(dados.total / PAGE_SIZE));

  return (
    <div className="line-page">
      <section className="dashboard-panel">
        <div className="admin-users__toolbar">
          <div className="admin-users__search">
            <input
              className="admin-users__input"
              type="search"
              placeholder="Buscar por nome ou e-mail"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <select
            className="admin-users__select"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos os papéis</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="admin-users__btn"
            onClick={() => setModal({ tipo: "novo" })}
          >
            Cadastrar novo usuário
          </button>
        </div>

        {sucesso && <p className="admin-users__feedback admin-users__feedback--ok">{sucesso}</p>}
        {erro && <p className="admin-users__feedback admin-users__feedback--erro">{erro}</p>}

        <div className="admin-users__table-wrap">
          <table className="admin-users__table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Papel</th>
                <th>Unidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados.itens.map((u) => {
                const ehEu = u.id === user?.id;
                return (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.unidade_saude || "—"}</td>
                    <td>
                      <span
                        className={`admin-users__badge admin-users__badge--${u.ativo ? "ativo" : "inativo"}`}
                      >
                        {u.ativo ? "Ativo" : "Bloqueado"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-users__actions">
                        <button
                          type="button"
                          className="admin-users__btn admin-users__btn--ghost admin-users__btn--small"
                          disabled={ehEu}
                          title={ehEu ? "Você não pode alterar o seu próprio papel" : ""}
                          onClick={() => setModal({ tipo: "papel", usuario: u })}
                        >
                          Papel
                        </button>
                        <button
                          type="button"
                          className="admin-users__btn admin-users__btn--ghost admin-users__btn--small"
                          onClick={() => setModal({ tipo: "senha", usuario: u })}
                        >
                          Senha
                        </button>
                        <button
                          type="button"
                          className={`admin-users__btn admin-users__btn--small ${u.ativo ? "admin-users__btn--danger" : "admin-users__btn--ghost"}`}
                          disabled={atualizandoId === u.id || (ehEu && u.ativo)}
                          title={ehEu && u.ativo ? "Você não pode bloquear a sua própria conta" : ""}
                          onClick={() => alternarStatus(u)}
                        >
                          {u.ativo ? "Bloquear" : "Ativar"}
                        </button>
                        <button
                          type="button"
                          className="admin-users__btn admin-users__btn--danger admin-users__btn--small"
                          disabled={ehEu}
                          title={ehEu ? "Você não pode excluir a sua própria conta" : ""}
                          onClick={() => setModal({ tipo: "excluir", usuario: u })}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {carregando && <p className="admin-users__empty">Carregando usuários...</p>}
          {!carregando && !erro && dados.itens.length === 0 && (
            <p className="admin-users__empty">Nenhum usuário encontrado.</p>
          )}
        </div>

        <div className="admin-users__pager">
          <span>
            {dados.total} usuário(s) · página {page} de {totalPaginas}
          </span>
          <div className="admin-users__pager-buttons">
            <button
              type="button"
              className="admin-users__btn admin-users__btn--ghost admin-users__btn--small"
              disabled={page <= 1 || carregando}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              className="admin-users__btn admin-users__btn--ghost admin-users__btn--small"
              disabled={page >= totalPaginas || carregando}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      </section>

      {modal?.tipo === "novo" && (
        <NovoUsuarioModal
          onClose={() => setModal(null)}
          onCreated={() => fecharComSucesso("Usuário cadastrado. Ele deverá trocar a senha no primeiro acesso.")}
        />
      )}
      {modal?.tipo === "senha" && (
        <RedefinirSenhaModal
          usuario={modal.usuario}
          onClose={() => setModal(null)}
          onDone={fecharComSucesso}
        />
      )}
      {modal?.tipo === "excluir" && (
        <ExcluirUsuarioModal
          usuario={modal.usuario}
          onClose={() => setModal(null)}
          onDone={fecharComSucesso}
        />
      )}
      {modal?.tipo === "papel" && (
        <AlterarPapelModal
          usuario={modal.usuario}
          onClose={() => setModal(null)}
          onDone={fecharComSucesso}
        />
      )}
    </div>
  );
}
