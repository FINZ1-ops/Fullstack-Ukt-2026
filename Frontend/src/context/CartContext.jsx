import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

// Voucher dengan waktu terbatas — expire dalam milidetik dari sekarang
const now = Date.now();
export const VOUCHERS = [
  { code: "FASHION10", discount: 10, type: "percent", label: "Diskon 10%", expires: now + 3 * 24 * 60 * 60 * 1000 },
  { code: "HEMAT50K",  discount: 50000, type: "flat", label: "Potongan Rp50.000", expires: now + 7 * 24 * 60 * 60 * 1000 },
  { code: "WELCOME20", discount: 20, type: "percent", label: "Diskon 20% Member Baru", expires: now + 1 * 24 * 60 * 60 * 1000 },
  { code: "SALE15",    discount: 15, type: "percent", label: "Sale 15%", expires: now + 5 * 24 * 60 * 60 * 1000 },
  { code: "GRATIS25K", discount: 25000, type: "flat", label: "Potongan Rp25.000", expires: now + 2 * 24 * 60 * 60 * 1000 },
];

const CART_LIMIT = 200;

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; }
    catch { return []; }
  });
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product, qty = 1) => {
    if (totalItems + qty > CART_LIMIT) {
      return { error: `Keranjang maksimal ${CART_LIMIT} item` };
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...product, qty }];
    });
    return { success: true };
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, qty } : i));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedVoucher(null);
    localStorage.removeItem("cart");
  };

  const applyVoucher = (code) => {
    const v = VOUCHERS.find(v => v.code === code.toUpperCase());
    if (!v) return { error: "Kode voucher tidak valid" };
    if (Date.now() > v.expires) return { error: "Voucher sudah kadaluarsa" };
    setAppliedVoucher(v);
    return { success: true, voucher: v };
  };

  const removeVoucher = () => setAppliedVoucher(null);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmount = appliedVoucher
    ? appliedVoucher.type === "percent"
      ? Math.floor(subtotal * appliedVoucher.discount / 100)
      : appliedVoucher.discount
    : 0;
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider value={{
      cart, totalItems, addToCart, removeFromCart, updateQty, clearCart,
      appliedVoucher, applyVoucher, removeVoucher,
      subtotal, discountAmount, total, CART_LIMIT,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
