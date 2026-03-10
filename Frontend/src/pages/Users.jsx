import { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser } from "../api/users.api";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const fetchData = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (u) => {
    setForm({ fullname: u.fullname, username: u.username, email: u.email, role: u.role, _is_active_disabled: u._is_active_disabled });
    setError("");
    setModal({ id: u.id });
  };

  const handleSubmit = async () => {
    setSaving(true); setError("");
    try {
      await updateUser(modal.id, form);
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus user ini? Tindakan ini tidak bisa dibatalkan.")) return;
    await deleteUser(id); fetchData();
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.fullname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} pengguna terdaftar</p>
        </div>
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        {loading ? <div className="loading">Memuat...</div> : (
          <table>
            <thead><tr><th>ID</th><th>Nama</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} className="empty">Tidak ada user</td></tr>
                : filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: "var(--text-muted)" }}>#{u.id}</td>
                    <td><strong>{u.fullname}</strong></td>
                    <td style={{ color: "var(--text-muted)" }}>@{u.username}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === "admin" ? "badge-yellow" : "badge-gray"}`}>{u.role}</span></td>
                    <td>
                      {u._is_active_disabled
                        ? <span className="badge badge-red">Nonaktif</span>
                        : <span className="badge badge-green">Aktif</span>}
                    </td>
                    <td>
                      {isAdmin ? (
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Hapus</button>
                        </div>
                      ) : <span style={{color:"var(--text-muted)"}}>-</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Edit User" onClose={() => setModal(null)}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group"><label>Nama Lengkap</label>
            <input className="form-control" value={form.fullname || ""} onChange={e => setForm({...form, fullname: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group"><label>Username</label>
              <input className="form-control" value={form.username || ""} onChange={e => setForm({...form, username: e.target.value})} />
            </div>
            <div className="form-group"><label>Role</label>
              <select className="form-control" value={form.role || ""} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Email</label>
            <input className="form-control" type="email" value={form.email || ""} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={form._is_active_disabled || false} onChange={e => setForm({...form, _is_active_disabled: e.target.checked})} />
            Nonaktifkan akun ini
          </label>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
