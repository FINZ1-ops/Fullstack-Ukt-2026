import { useEffect, useState } from "react";
import { getOrders } from "../api/orders.api";
import { getTransactions } from "../api/transactions.api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLOR = {
  pending: "badge-yellow",
  processing: "badge-gray",
  completed: "badge-green",
  cancelled: "badge-red",
  paid: "badge-green",
  failed: "badge-red",
  refunded: "badge-gray",
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("orders");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oRes, tRes] = await Promise.allSettled([getOrders(), getTransactions()]);
        const allOrders = oRes.value?.data?.data || [];
        const allTx = tRes.value?.data?.data || [];
        // Filter hanya milik user ini
        setOrders(allOrders.filter(o => o.customer_id === user.id));
        setTransactions(allTx.filter(t => {
          const myOrderIds = allOrders.filter(o => o.customer_id === user.id).map(o => o.id);
          return myOrderIds.includes(t.order_id);
        }));
      } catch {
        setOrders([]); setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pesanan Saya</h1>
          <p className="page-subtitle">Pantau status order dan pembayaran kamu</p>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["orders", "transactions"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-ghost"}`}>
            {t === "orders" ? "Pesanan" : "Pembayaran"}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Memuat...</div> : (
        tab === "orders" ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID Order</th><th>Status</th><th>Tanggal</th><th>Keterangan</th></tr>
              </thead>
              <tbody>
                {orders.length === 0
                  ? <tr><td colSpan={4} className="empty">Belum ada pesanan</td></tr>
                  : orders.map(o => (
                    <tr key={o.id}>
                      <td style={{ color: "var(--text-muted)" }}>#{o.id}</td>
                      <td><span className={`badge ${STATUS_COLOR[o.status] || "badge-gray"}`}>{o.status}</span></td>
                      <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        {o.order_date ? new Date(o.order_date).toLocaleString("id-ID") : "-"}
                      </td>
                      <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {o.status === "pending" && "Menunggu konfirmasi admin"}
                        {o.status === "processing" && "Sedang diproses"}
                        {o.status === "completed" && "Selesai ✓"}
                        {o.status === "cancelled" && "Dibatalkan"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID Transaksi</th><th>Order</th><th>Metode</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {transactions.length === 0
                  ? <tr><td colSpan={5} className="empty">Belum ada transaksi</td></tr>
                  : transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: "var(--text-muted)" }}>#{t.id}</td>
                      <td>Order #{t.order_id}</td>
                      <td><span className="badge badge-gray">{t.payment_method || "-"}</span></td>
                      <td><strong>Rp {Number(t.total_amount).toLocaleString("id-ID")}</strong></td>
                      <td><span className={`badge ${STATUS_COLOR[t.status] || "badge-gray"}`}>{t.status}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
