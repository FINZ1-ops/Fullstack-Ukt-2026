import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/products.api";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = { name: "", price: "", size: "", color: "", category: "clothing" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data? }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const fetchData = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data.data || []);
    } catch { setProducts([]); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setError(""); setModal({ mode: "add" }); };
const openEdit = (p) => {
    setForm({ name: p.name, price: p.price, size: p.size, color: p.color, category: p.category || "clothing" });
    setError("");
    setModal({ mode: "edit", id: p.id });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.size || !form.color) {
      setError("Semua field wajib diisi"); return;
    }
    setSaving(true); setError("");
    try {
      const payload = { ...form, price: Number(form.price) };
      if (modal.mode === "add") await createProduct(payload);
      else await updateProduct(modal.id, payload);
      setModal(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    await deleteProduct(id);
    fetchData();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} produk terdaftar</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ Tambah Produk</button>}
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="Cari nama atau kategori..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        {loading ? <div className="loading">Memuat...</div> : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Nama</th><th>Harga</th><th>Ukuran</th><th>Warna</th><th>Kategori</th><th>Status</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="empty">Tidak ada produk</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ color: "var(--text-muted)" }}>#{p.id}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>Rp {Number(p.price).toLocaleString("id-ID")}</td>
                  <td>{p.size}</td>
                  <td>{p.color}</td>
                  <td><span className="badge badge-yellow">{p.category}</span></td>
                  <td>
                    {p.available
                      ? <span className="badge badge-green">Tersedia</span>
                      : <span className="badge badge-red">Habis</span>}
                  </td>
                  <td>
                    {isAdmin ? (
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Hapus</button>
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
        <Modal title={modal.mode === "add" ? "Tambah Produk" : "Edit Produk"} onClose={() => setModal(null)}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label>Nama Produk</label>
            <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Kemeja Batik" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Harga (Rp)</label>
              <input className="form-control" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="150000" />
            </div>
            <div className="form-group">
              <label>Ukuran</label>
              <input className="form-control" value={form.size} onChange={e => setForm({...form, size: e.target.value})} placeholder="S, M, L, XL" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Warna</label>
              <input className="form-control" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="Merah, Biru..." />
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="clothing">Clothing</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
