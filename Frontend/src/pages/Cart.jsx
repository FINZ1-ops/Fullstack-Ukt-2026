import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useVouchers } from "../context/VoucherContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/orders.api";
import { createTransaction } from "../api/transactions.api";

const PAYMENT_METHODS = [
  { value: "cod", label: "COD (Bayar di Tempat)" },
  { value: "transfer", label: "Transfer Bank" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "debit_card", label: "Kartu Debit" },
  { value: "credit_card", label: "Kartu Kredit" },
  { value: "qris", label: "QRIS" },
];

export default function Cart() {
  const { cart, totalItems, removeFromCart, updateQty, clearCart,
          appliedVoucher, applyVoucher, removeVoucher,
          subtotal, discountAmount, total, CART_LIMIT } = useCart();
  const { myVouchers } = useVouchers();
  const { user } = useAuth();

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherMsg, setVoucherMsg] = useState({ text: "", type: "" });
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const handleApplyVoucher = () => {
    const res = applyVoucher(voucherInput);
    if (res.error) setVoucherMsg({ text: res.error, type: "error" });
    else setVoucherMsg({ text: `Voucher "${res.voucher.label}" berhasil diterapkan!`, type: "success" });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) { setError("Keranjang kosong"); return; }
    setOrdering(true); setError("");
    try {
      // Buat order dengan semua item
      const orderPayload = {
        customer_id: user.id,
        status: "pending",
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty, price: i.price })),
      };
      const orderRes = await createOrder(orderPayload);
      const orderId = orderRes.data?.data?.id || orderRes.data?.id;

      // Buat transaksi
      const txPayload = {
        order_id: orderId,
        payment_method: paymentMethod,
        total_amount: total,
        status: "pending",
        voucher_code: appliedVoucher?.code || null,
        discount_amount: discountAmount,
      };
      await createTransaction(txPayload);

      clearCart();
      setSuccess({ orderId, total, paymentMethod });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat order. Coba lagi.");
    } finally {
      setOrdering(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 520, margin: "60px auto", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, marginBottom: 8 }}>
          Order Berhasil!
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>
          Order #{success.orderId} telah dibuat dan menunggu konfirmasi admin.
        </p>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
          Metode: <strong style={{ color: "var(--accent)" }}>{success.paymentMethod.toUpperCase()}</strong> —
          Total: <strong style={{ color: "var(--accent)" }}>Rp {Number(success.total).toLocaleString("id-ID")}</strong>
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>
          Kasir akan mengkonfirmasi pembayaran kamu. Pantau di halaman <strong>Pesanan Saya</strong>.
        </p>
        <button className="btn btn-primary" onClick={() => setSuccess(null)}>
          Belanja Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Keranjang Belanja</h1>
          <p className="page-subtitle">{totalItems}/{CART_LIMIT} item</p>
        </div>
        {cart.length > 0 && (
          <button className="btn btn-ghost" onClick={clearCart}>Kosongkan</button>
        )}
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <p>Keranjang masih kosong.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Tambahkan produk dari halaman <strong>Belanja</strong>.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Daftar item */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produk</th><th>Harga</th><th>Qty</th><th>Subtotal</th><th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {item.size} · {item.color} · {item.category}
                      </div>
                    </td>
                    <td>Rp {Number(item.price).toLocaleString("id-ID")}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                        <span style={{ minWidth: 24, textAlign: "center" }}>{item.qty}</span>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                    </td>
                    <td><strong>Rp {(item.price * item.qty).toLocaleString("id-ID")}</strong></td>
                    <td>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => removeFromCart(item.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Panel kanan - ringkasan */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Voucher saya */}
            {myVouchers.length > 0 && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "var(--text-muted)" }}>
                  🎟 VOUCHER KAMU
                </p>
                {myVouchers.map(v => {
                  const expired = Date.now() > v.expires;
                  const sisa = Math.max(0, Math.ceil((v.expires - Date.now()) / 86400000));
                  return (
                    <div key={v.code}
                      onClick={() => !expired && setVoucherInput(v.code)}
                      style={{
                        padding: "10px 12px", marginBottom: 8,
                        background: expired ? "transparent" : "var(--accent-dim)",
                        border: `1px dashed ${expired ? "var(--border)" : "var(--accent)"}`,
                        borderRadius: 8, cursor: expired ? "not-allowed" : "pointer",
                        opacity: expired ? 0.4 : 1,
                      }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--accent)" }}>{v.code}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.label}</div>
                      <div style={{ fontSize: 11, color: expired ? "var(--danger)" : "var(--text-muted)" }}>
                        {expired ? "Kadaluarsa" : `Sisa ${sisa} hari`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Input voucher */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "var(--text-muted)" }}>KODE VOUCHER</p>
              {appliedVoucher ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--success)", fontSize: 13 }}>✓ {appliedVoucher.code}</span>
                  <button className="btn btn-ghost btn-sm" onClick={removeVoucher}>Hapus</button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="form-control"
                      placeholder="Masukkan kode..."
                      value={voucherInput}
                      onChange={e => setVoucherInput(e.target.value.toUpperCase())}
                      style={{ flex: 1, fontSize: 13 }}
                    />
                    <button className="btn btn-ghost btn-sm" onClick={handleApplyVoucher}>Pakai</button>
                  </div>
                  {voucherMsg.text && (
                    <p style={{ fontSize: 12, marginTop: 6, color: voucherMsg.type === "error" ? "var(--danger)" : "var(--success)" }}>
                      {voucherMsg.text}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Metode pembayaran */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "var(--text-muted)" }}>METODE PEMBAYARAN</p>
              <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            {/* Ringkasan harga */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: "var(--text-muted)" }}>RINGKASAN HARGA</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                <span>Subtotal ({totalItems} item)</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "var(--success)" }}>
                  <span>Diskon ({appliedVoucher?.code})</span>
                  <span>− Rp {discountAmount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 15 }}>
                <span>Total</span>
                <span style={{ color: "var(--accent)" }}>Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}

            <button
              className="btn btn-primary"
              onClick={handleCheckout}
              disabled={ordering || cart.length === 0}
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
              {ordering ? "Memproses..." : "Buat Pesanan →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
