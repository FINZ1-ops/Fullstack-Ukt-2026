import { useEffect, useState } from "react";
import { getTransactions, updateTransaction, deleteTransaction } from "../api/transactions.api";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const PAYMENT_METHODS = [
  { value: "cod", label: "COD" },
  { value: "transfer", label: "Transfer Bank" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "debit_card", label: "Kartu Debit" },
  { value: "credit_card", label: "Kartu Kredit" },
  { value: "qris", label: "QRIS" },
];
const STATUS_OPTIONS = ["pending", "paid", "failed", "refunded"];

const badgeClass = (status) => ({
  paid: "badge-green", failed: "badge-red",
  pending: "badge-yellow", refunded: "badge-gray",
})[status] || "badge-gray";

export default function Transactions() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isCashier = user?.role === "cashier";
  const canEdit = isAdmin || isCashier;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await getTransactions();
      setItems(res.data.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Kasir buka modal konfirmasi pembayaran
  const openConfirm = (t) => {
    setForm({ payment_method: t.payment_method || "transfer", status: "paid" });
    setError("");
    setModal({ mode: "confirm", id: t.id, tx: t });
  };

  // Admin buka modal edit bebas
  const openEdit = (t) => {
    setForm({ order_id: t.order_id, payment_method: t.payment_method || "transfer", total_amount: t.total_amount, status: t.status });
    setError("");
    setModal({ mode: "edit", id: t.id });
  };

  const handleSubmit = async () => {
    setSaving(true); setError("");
    try {
      if (modal.mode === "confirm") {
        // Kasir hanya update status + payment method
        await updateTransaction(modal.id, { ...modal.tx, payment_method: form.payment_method, status: "paid" });
      } else {
        await updateTransaction(modal.id, { ...form, order_id: Number(form.order_id), total_amount: Number(form.total_amount) });
      }
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await deleteTransaction(id); fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{items.length} transaksi</p>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? <div className="loading">Memuat...</div> : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Order</th><th>Metode</th>
                <th>Total</th><th>Diskon</th><th>Status</th>
                {canEdit && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0
                ? <tr><td colSpan={7} className="empty">Belum ada transaksi</td></tr>
                : items.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: "var(--text-muted)" }}>#{t.id}</td>
                    <td>Order #{t.order_id}</td>
                    <td>
                      <span className="badge badge-gray">{t.payment_method || "-"}</span>
                    </td>
                    <td><strong>Rp {Number(t.total_amount).toLocaleString("id-ID")}</strong></td>
                    <td style={{ color: "var(--success)", fontSize: 13 }}>
                      {t.discount_amount > 0 ? `- Rp ${Number(t.discount_amount).toLocaleString("id-ID")}` : "-"}
                    </td>
                    <td><span className={`badge ${badgeClass(t.status)}`}>{t.status}</span></td>
                    {canEdit && (
                      <td>
                        <div className="actions">
                          {/* Kasir: konfirmasi transaksi pending */}
                          {t.status === "pending" && (
                            <button className="btn btn-primary btn-sm" onClick={() => openConfirm(t)}>
                              Konfirmasi
                            </button>
                          )}
                          {/* Admin: edit & hapus bebas */}
                          {isAdmin && (
                            <>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Hapus</button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal kasir: konfirmasi pembayaran */}
      {modal?.mode === "confirm" && (
        <Modal title="Konfirmasi Pembayaran" onClose={() => setModal(null)}>
          {error && <div className="login-error">{error}</div>}
          <p style={{ fontSize: 14, marginBottom: 16, color: "var(--text-muted)" }}>
            Konfirmasi pembayaran transaksi <strong style={{ color: "var(--text)" }}>#{modal.id}</strong> — Total:{" "}
            <strong style={{ color: "var(--accent)" }}>Rp {Number(modal.tx?.total_amount).toLocaleString("id-ID")}</strong>
          </p>
          <div className="form-group">
            <label>Metode Pembayaran</label>
            <select className="form-control" value={form.payment_method}
              onChange={e => setForm({ ...form, payment_method: e.target.value })}>
              {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Memproses..." : "✓ Konfirmasi Lunas"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal admin: edit bebas */}
      {modal?.mode === "edit" && (
        <Modal title="Edit Transaksi" onClose={() => setModal(null)}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label>Order ID</label>
              <input className="form-control" type="number" value={form.order_id}
                onChange={e => setForm({ ...form, order_id: e.target.value })} />
            </div>
            <div className="form-group"><label>Total (Rp)</label>
              <input className="form-control" type="number" value={form.total_amount}
                onChange={e => setForm({ ...form, total_amount: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Metode Pembayaran</label>
              <select className="form-control" value={form.payment_method}
                onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
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
