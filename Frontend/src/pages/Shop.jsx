import { useEffect, useState } from "react";
import { getProducts } from "../api/products.api";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [toasts, setToasts] = useState([]);
  const { addToCart, totalItems, CART_LIMIT } = useCart();

  useEffect(() => {
    getProducts()
      .then(res => setProducts(res.data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  };

  const handleAdd = (product) => {
    const res = addToCart(product, 1);
    if (res?.error) showToast(res.error, "error");
    else showToast(`"${product.name}" ditambahkan ke keranjang`);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat && p.available;
  });

  const categories = ["all", ...new Set(products.map(p => p.category))];

  return (
    <div>
      {/* Toast notifikasi */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: t.type === "error" ? "var(--danger-dim)" : "var(--success-dim)",
            border: `1px solid ${t.type === "error" ? "var(--danger)" : "var(--success)"}`,
            color: t.type === "error" ? "var(--danger)" : "var(--success)",
            animation: "fadeIn 0.2s ease",
          }}>
            {t.msg}
          </div>
        ))}
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Belanja</h1>
          <p className="page-subtitle">{filtered.length} produk tersedia · Keranjang: {totalItems}/{CART_LIMIT}</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          className="search-input"
          placeholder="Cari produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`btn btn-sm ${category === c ? "btn-primary" : "btn-ghost"}`}>
              {c === "all" ? "Semua" : c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Memuat produk...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          Tidak ada produk yang sesuai.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {p.category}
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="badge badge-gray">{p.size}</span>
                <span className="badge badge-gray">{p.color}</span>
                {p.stock != null && (
                  <span className={`badge ${p.stock > 5 ? "badge-green" : "badge-red"}`}>
                    Stok: {p.stock}
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>
                Rp {Number(p.price).toLocaleString("id-ID")}
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAdd(p)}
                disabled={totalItems >= CART_LIMIT}
                style={{ width: "100%", justifyContent: "center", gap: 6 }}>
                <ShoppingCart size={14} /> Tambah ke Keranjang
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
