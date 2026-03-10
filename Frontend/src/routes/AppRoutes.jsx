import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import Stocks from "../pages/Stocks";
import Orders from "../pages/Orders";
import Transactions from "../pages/Transactions";
import Users from "../pages/Users";
import Shop from "../pages/Shop";
import Cart from "../pages/Cart";
import MyOrders from "../pages/MyOrders";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Halaman publik */}
      <Route path="/login" element={<Login />} />

      {/* Semua route wajib login */}
      <Route path="/"             element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products"     element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/categories"   element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/stocks"       element={<ProtectedRoute><Stocks /></ProtectedRoute>} />
      <Route path="/orders"       element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/users"        element={<ProtectedRoute><Users /></ProtectedRoute>} />

      {/* Route khusus user */}
      <Route path="/shop"         element={<ProtectedRoute><Shop /></ProtectedRoute>} />
      <Route path="/cart"         element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/my-orders"    element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
    </Routes>
  );
}
