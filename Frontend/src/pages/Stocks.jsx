import { useEffect, useState } from "react";
import { getStocks, createStock } from "../api/stocks.api";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const EMPTY = { product_id: "", quantity_change: "", action: "masuk" };

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "cashier";

  const fetchData = async () => {
    try {
      const res = await getStocks();
      setStocks(res.data.data || []);
    } catch { setStocks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.product_id || !form.quantity_change || !form.action) {
      setError("Semua field wajib diisi"); return;
    }
    setSaving(true); setError("");
    try {
      await createStock({ ...form, product_id: Number(form.product_id), quantity_change: Number(form.quantity_change) });
      setModal(false); setForm(EMPTY); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stocks</h1>
          <p className="page-subtitle">Riwayat perubahan stok produk</p>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setError(""); setModal(true); }}>+ Tambah Stok</button>}
      </div>

      <div className="table-wrap">
        {loading ? <div className="loading">Memuat...</div> : (
          <table>
            <thead><tr><th>ID</th><th>Produk</th><th>Perubahan Qty</th><th>Aksi</th><th>Tanggal</th></tr></thead>
            <tbody>
              {stocks.length === 0
                ? <tr><td colSpan={5} className="empty">Belum ada riwayat stok</td></tr>
                : stocks.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--text-muted)" }}>#{s.id}</td>
                    <td><strong>{s.product_name || `Produk #${s.product_id}`}</strong></td>
                    <td style={{ color: s.quantity_change > 0 ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                      {s.quantity_change > 0 ? "+" : ""}{s.quantity_change}
                    </td>
                    <td><span className={`badge ${s.action === "masuk" ? "badge-green" : "badge-red"}`}>{s.action}</span></td>
                    <td style={{ color: "var(--text-muted)" }}>{s.created_at ? new Date(s.created_at).toLocaleString("id-ID") : "-"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Tambah Riwayat Stok" onClose={() => setModal(false)}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group"><label>Product ID</label>
            <input className="form-control" type="number" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} placeholder="ID produk" />
          </div>
          <div className="form-row">
            <div className="form-group"><label>Jumlah</label>
              <input className="form-control" type="number" value={form.quantity_change} onChange={e => setForm({...form, quantity_change: e.target.value})} placeholder="Contoh: 10 atau -5" />
            </div>
            <div className="form-group"><label>Tipe</label>
              <select className="form-control" value={form.action} onChange={e => setForm({...form, action: e.target.value})}>
                <option value="masuk">Masuk</option>
                <option value="keluar">Keluar</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
