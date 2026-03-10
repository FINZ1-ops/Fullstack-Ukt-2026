import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products.api";
import { getUsers } from "../api/users.api";
import { getOrders } from "../api/orders.api";
import { getTransactions } from "../api/transactions.api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useVouchers } from "../context/VoucherContext";
import { Shirt, Tag, Package, ShoppingCart, CreditCard, Users, ShoppingBag, Ticket } from "lucide-react";

// Dashboard Admin / Kasir
function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, transactions: 0 });
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [p, u, o, t] = await Promise.allSettled([
          getProducts(), getUsers(), getOrders(), getTransactions()
        ]);
        const orders = o.value?.data?.data || [];
        setStats({
          products: p.value?.data?.count ?? 0,
          users: u.value?.data?.count ?? 0,
          orders: orders.length,
          transactions: t.value?.data?.count ?? 0,
        });
        // Ambil order pending untuk konfirmasi
        setPending(orders.filter(o => o.status === "pending").slice(0, 5));
      } catch {/* ignore */}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const statCards = [
    { icon: <Shirt size={22} />, label: "Total Produk", value: stats.products, to: "/products" },
    { icon: <ShoppingCart size={22} />, label: "Orders", value: stats.orders, to: "/orders" },
    { icon: <CreditCard size={22} />, label: "Transaksi", value: stats.transactions, to: "/transactions" },
    { icon: <Users size={22} />, label: "Users", value: stats.users, to: "/users" },
  ];

  const adminLinks = [
    { to: "/products",     icon: <Shirt size={20} />,        label: "Products",     desc: "Kelola data produk" },
    { to: "/categories",   icon: <Tag size={20} />,           label: "Categories",   desc: "Kelola kategori" },
    { to: "/stocks",       icon: <Package size={20} />,       label: "Stocks",       desc: "Riwayat stok" },
    { to: "/orders",       icon: <ShoppingCart size={20} />,  label: "Orders",       desc: "Konfirmasi pesanan user" },
    { to: "/transactions", icon: <CreditCard size={20} />,    label: "Transactions", desc: "Konfirmasi pembayaran" },
    { to: "/users",        icon: <Users size={20} />,         label: "Users",        desc: "Manajemen pengguna" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Selamat datang, {user?.fullname} ({user?.role}) —{" "}
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {loading ? <div className="loading">Memuat data...</div> : (
        <>
          <div className="stats-grid">
            {statCards.map(s => (
              <Link key={s.to} to={s.to} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="stat-card" style={{ cursor: "pointer", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  <div className="stat-icon" style={{ color: "var(--accent)" }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Order pending perlu konfirmasi */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-muted)" }}>
                ⏳ PESANAN MENUNGGU KONFIRMASI
              </h2>
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "var(--text-muted)" }}>Order ID</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "var(--text-muted)" }}>Customer</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "var(--text-muted)" }}>Tanggal</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "var(--text-muted)" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(o => (
                      <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--text-muted)" }}>#{o.id}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13 }}>Customer #{o.customer_id}</td>
                        <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                          {o.order_date ? new Date(o.order_date).toLocaleString("id-ID") : "-"}
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <Link to="/orders" className="btn btn-ghost btn-sm">Lihat →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-muted)" }}>MENU CEPAT</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
            {adminLinks.map(l => (
              <Link key={l.to} to={l.to} style={{ textDecoration: "none" }}>
                <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  <span style={{ color: "var(--accent)" }}>{l.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{l.label}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Dashboard User ──
function UserDashboard({ user }) {
  const { totalItems, total, cart } = useCart();
  const { myVouchers } = useVouchers();
  const [orderCount, setOrderCount] = useState(0);
  const validVouchers = myVouchers.filter(v => Date.now() < v.expires);

  useEffect(() => {
    getOrders().then(res => {
      const all = res.data?.data || [];
      setOrderCount(all.filter(o => o.customer_id === user.id).length);
    }).catch(() => {});
  }, [user.id]);

  const quickLinks = [
    { to: "/shop",      icon: <ShoppingBag size={20} />, label: "Belanja",       desc: "Jelajahi & beli produk", accent: true },
    { to: "/cart",      icon: <ShoppingCart size={20} />, label: `Keranjang (${totalItems})`, desc: totalItems > 0 ? `Rp ${total.toLocaleString("id-ID")}` : "Keranjang kosong" },
    { to: "/my-orders", icon: <CreditCard size={20} />,  label: "Pesanan Saya",  desc: `${orderCount} pesanan` },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Halo, {user?.fullname?.split(" ")[0]} 👋</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to} style={{ textDecoration: "none" }}>
            <div style={{
              background: l.accent ? "var(--accent-dim)" : "var(--bg2)",
              border: `1px solid ${l.accent ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius)", padding: "20px",
              display: "flex", flexDirection: "column", gap: 8, cursor: "pointer",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = l.accent ? "var(--accent)" : "var(--border)"}>
              <span style={{ color: "var(--accent)" }}>{l.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{l.label}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.desc}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Voucher aktif */}
      {validVouchers.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <Ticket size={14} /> VOUCHER AKTIF KAMU
          </h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {validVouchers.map(v => {
              const sisa = Math.max(0, Math.ceil((v.expires - Date.now()) / 86400000));
              return (
                <div key={v.code} style={{
                  background: "var(--accent-dim)", border: "1px dashed var(--accent)",
                  borderRadius: "var(--radius)", padding: "16px 20px", minWidth: 180,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)", letterSpacing: "0.05em" }}>{v.code}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{v.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Sisa {sisa} hari</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keranjang preview jika ada isi */}
      {cart.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-muted)" }}>
            🛒 KERANJANG KAMU ({totalItems} item)
          </h2>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
            {cart.slice(0, 3).map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                <span>{item.name} <span style={{ color: "var(--text-muted)" }}>× {item.qty}</span></span>
                <span>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
              </div>
            ))}
            {cart.length > 3 && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>+{cart.length - 3} item lainnya...</p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <Link to="/cart" className="btn btn-primary btn-sm">Lihat Keranjang →</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdminOrCashier = user?.role === "admin" || user?.role === "cashier";
  return isAdminOrCashier ? <AdminDashboard user={user} /> : <UserDashboard user={user} />;
}
