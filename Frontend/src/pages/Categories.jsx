import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../api/categories.api";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const EMPTY = { name: "", description: "" };

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const fetchData = async () => {
    try {
      const res = await getCategories();
      setItems(res.data.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setForm(EMPTY); setError(""); setModal({ mode: "add" }); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description || "" }); setError(""); setModal({ mode: "edit", id: c.id }); };

  const handleSubmit = async () => {
    if (!form.name) { setError("Nama kategori wajib diisi"); return; }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") await createCategory(form);
      else await updateCategory(modal.id, form);
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus kategori ini?")) return;
    await deleteCategory(id); fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{items.length} kategori terdaftar</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ Tambah Kategori</button>}
      </div>

      <div className="table-wrap">
        {loading ? <div className="loading">Memuat...</div> : (
          <table>
            <thead><tr><th>ID</th><th>Nama</th><th>Deskripsi</th><th>Aksi</th></tr></thead>
            <tbody>
              {items.length === 0
                ? <tr><td colSpan={4} className="empty">Belum ada kategori</td></tr>
                : items.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--text-muted)" }}>#{c.id}</td>
                    <td><strong>{c.name}</strong></td>
                    <td style={{ color: "var(--text-muted)" }}>{c.description || "-"}</td>
                    <td>
                      {isAdmin ? (
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Hapus</button>
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
        <Modal title={modal.mode === "add" ? "Tambah Kategori" : "Edit Kategori"} onClose={() => setModal(null)}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label>Nama Kategori</label>
            <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Pakaian Pria" />
          </div>
          <div className="form-group">
            <label>Deskripsi</label>
            <input className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Opsional" />
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
