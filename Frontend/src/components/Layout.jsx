import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { logout } from "../api/auth.api";
import { Shirt, Tag, Package, ShoppingCart, CreditCard, Users, ShoppingBag, LayoutDashboard, Ticket } from "lucide-react";

export default function Layout({ children }) {
  const { user, clearAuth } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const role = user?.role;
  const isAdmin = role === "admin";
  const isCashier = role === "cashier";
  const isUser = role === "user";

  const adminNav = [
    { to: "/",             label: "Dashboard",    icon: <LayoutDashboard size={16} /> },
    { to: "/products",     label: "Products",     icon: <Shirt size={16} /> },
    { to: "/categories",   label: "Categories",   icon: <Tag size={16} /> },
    { to: "/stocks",       label: "Stocks",       icon: <Package size={16} /> },
    { to: "/orders",       label: "Orders",       icon: <ShoppingCart size={16} /> },
    { to: "/transactions", label: "Transactions", icon: <CreditCard size={16} /> },
    { to: "/users",        label: "Users",        icon: <Users size={16} /> },
  ];

  const cashierNav = [
    { to: "/",             label: "Dashboard",    icon: <LayoutDashboard size={16} /> },
    { to: "/products",     label: "Products",     icon: <Shirt size={16} /> },
    { to: "/categories",   label: "Categories",   icon: <Tag size={16} /> },
    { to: "/stocks",       label: "Stocks",       icon: <Package size={16} /> },
    { to: "/orders",       label: "Orders",       icon: <ShoppingCart size={16} /> },
    { to: "/transactions", label: "Transactions", icon: <CreditCard size={16} /> },
  ];

  const userNav = [
    { to: "/",          label: "Dashboard",  icon: <LayoutDashboard size={16} /> },
    { to: "/shop",      label: "Belanja",    icon: <ShoppingBag size={16} /> },
    {
      to: "/cart",
      label: totalItems > 0 ? `Keranjang (${totalItems})` : "Keranjang",
      icon: <ShoppingCart size={16} />,
      badge: totalItems > 0 ? totalItems : null,
    },
    { to: "/my-orders", label: "Pesanan Saya", icon: <CreditCard size={16} /> },
    { to: "/products",  label: "Katalog",    icon: <Shirt size={16} /> },
  ];

  const navItems = isAdmin ? adminNav : isCashier ? cashierNav : userNav;

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    finally { clearAuth(); navigate("/login"); }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">✦</span>
          <span className="logo-text">FashionStore</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: "var(--accent)", color: "#0f0f0f",
                  borderRadius: 99, fontSize: 10, fontWeight: 700,
                  padding: "1px 6px", lineHeight: "16px",
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.fullname?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="user-name">{user?.fullname || "User"}</div>
              <div className="user-role">{user?.role || "-"}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
