import { useEffect, useState } from "react";
import { getOrders, createOrder, updateOrder, deleteOrder } from "../api/orders.api";
import { getTransactions, updateTransaction } from "../api/transactions.api";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["pending", "processing", "completed", "cancelled"];
const PAYMENT_METHODS = [
  { value: "cod", label: "COD" },
  { value: "transfer", label: "Transfer Bank" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "debit_card", label: "Kartu Debit" },
  { value: "credit_card", label: "Kartu Kredit" },
  { value: "qris", label: "QRIS" },
];
const EMPTY = { customer_id: "", status: "pending" };

const badgeClass = (status) => ({
  pending: "badge-yellow", processing: "badge-gray",
  completed: "badge-green", cancelled: "badge-red",
})[status] || "badge-gray";

export default function Orders() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isCashier = user?.role === "cashier";
  const canEdit = isAdmin || isCashier;

  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { order }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  const fetchData = async () => {
    try {
      const [oRes, tRes] = await Promise.allSettled([getOrders(), getTransactions()]);
      setOrders(oRes.value?.data?.data || []);
      setTransactions(tRes.value?.data?.data || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const getOrderTx = (orderId) => transactions.find(t => t.order_id === orderId);

  const openAdd = () => { setForm(EMPTY); setError(""); setModal({ mode: "add" }); };
  const openEdit = (o) => { setForm({ customer_id: o.customer_id, status: o.status }); setError(""); setModal({ mode: "edit", id: o.id }); };

  const handleSubmit = async () => {
    if (!form.customer_id) { setError("Customer ID wajib diisi"); return; }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") await createOrder({ ...form, customer_id: Number(form.customer_id) });
      else await updateOrder(modal.id, { ...form, customer_id: Number(form.customer_id) });
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  // Kasir konfirmasi order → update status order + transaksi sekaligus
  const handleConfirm = async () => {
    if (!confirmModal) return;
    setSaving(true); setError("");
    try {
      const { order } = confirmModal;
      // Update status order → processing
      await updateOrder(order.id, { customer_id: order.customer_id, status: "processing" });
      // Update transaksi jika ada, set metode pembayaran
      const tx = getOrderTx(order.id);
      if (tx) {
        await updateTransaction(tx.id, { ...tx, status: "paid", payment_method: paymentMethod });
      }
      setConfirmModal(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal konfirmasi");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus order ini?")) return;
    await deleteOrder(id); fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} pesanan</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openAdd}>+ Tambah Order</button>
        )}
      </div>

      <div className="table-wrap">
        {loading ? <div className="loading">Memuat...</div> : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Status</th>
                <th>Pembayaran</th><th>Tanggal</th>
                {canEdit && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0
                ? <tr><td colSpan={6} className="empty">Belum ada order</td></tr>
                : orders.map(o => {
                  const tx = getOrderTx(o.id);
                  return (
                    <tr key={o.id}>
                      <td style={{ color: "var(--text-muted)" }}>#{o.id}</td>
                      <td>Customer #{o.customer_id}</td>
                      <td><span className={`badge ${badgeClass(o.status)}`}>{o.status}</span></td>
                      <td>
                        {tx
                          ? <span className="badge badge-gray">{tx.payment_method || "-"}</span>
                          : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                        {o.order_date ? new Date(o.order_date).toLocaleString("id-ID") : "-"}
                      </td>
                      {canEdit && (
                        <td>
                          <div className="actions">
                            {/* Kasir: tombol konfirmasi untuk pending */}
                            {o.status === "pending" && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => { setConfirmModal({ order: o }); setPaymentMethod(tx?.payment_method || "transfer"); }}>
                                Konfirmasi
                              </button>
                            )}
                            {isAdmin && (
                              <>
                                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(o)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Hapus</button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal tambah/edit order (admin) */}
      {modal && (
        <Modal title={modal.mode === "add" ? "Tambah Order" : "Edit Order"} onClose={() => setModal(null)}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group"><label>Customer ID</label>
            <input className="form-control" type="number" value={form.customer_id}
              onChange={e => setForm({ ...form, customer_id: e.target.value })} placeholder="ID customer" />
          </div>
          <div className="form-group"><label>Status</label>
            <select className="form-control" value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal konfirmasi order (kasir/admin) */}
      {confirmModal && (
        <Modal title="Konfirmasi Pesanan" onClose={() => setConfirmModal(null)}>
          {error && <div className="login-error">{error}</div>}
          <p style={{ fontSize: 14, marginBottom: 16, color: "var(--text-muted)" }}>
            Konfirmasi order <strong style={{ color: "var(--text)" }}>#{confirmModal.order.id}</strong> dari Customer #{confirmModal.order.customer_id}.
            Status akan berubah menjadi <strong>processing</strong> dan transaksi akan di-update ke <strong>paid</strong>.
          </p>
          <div className="form-group">
            <label>Metode Pembayaran</label>
            <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>Batal</button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
              {saving ? "Memproses..." : "✓ Konfirmasi"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
