import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { VoucherProvider } from "./context/VoucherContext";
import "./index.css";

// VoucherProvider butuh user.id jadi harus di dalam AuthProvider
function AppWithProviders() {
  const { user } = useAuth();
  return (
    <VoucherProvider userId={user?.id}>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </VoucherProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWithProviders />
    </AuthProvider>
  );
}

export default App;
