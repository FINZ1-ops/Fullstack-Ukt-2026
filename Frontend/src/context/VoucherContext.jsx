import { createContext, useContext, useState, useEffect } from "react";
import { VOUCHERS } from "./CartContext";

const VoucherContext = createContext(null);

export function VoucherProvider({ children, userId }) {
  const [myVouchers, setMyVouchers] = useState([]);

  useEffect(() => {
    if (!userId) { setMyVouchers([]); return; }
    const key = `vouchers_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setMyVouchers(JSON.parse(stored));
      return;
    }
    // Assign 2 voucher random ke user baru
    const shuffled = [...VOUCHERS].sort(() => Math.random() - 0.5);
    const assigned = shuffled.slice(0, 2);
    localStorage.setItem(key, JSON.stringify(assigned));
    setMyVouchers(assigned);
  }, [userId]);

  return (
    <VoucherContext.Provider value={{ myVouchers }}>
      {children}
    </VoucherContext.Provider>
  );
}

export const useVouchers = () => useContext(VoucherContext);
