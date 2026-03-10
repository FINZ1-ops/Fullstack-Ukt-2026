import { useState } from "react";
import { login, register } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Kode verifikasi khusus untuk mendaftar sebagai kasir
// Ganti sesuai kebutuhan
const KODE_KASIR = "KASIR2025";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"

  // State login
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // State register
  const [regForm, setRegForm] = useState({
    fullname: "", username: "", email: "", password: "", role: "user",
  });
  const [showRegPass, setShowRegPass]   = useState(false);
  const [kodeKasir, setKodeKasir]       = useState("");
  const [showKodeKasir, setShowKodeKasir] = useState(false);

  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate     = useNavigate();
  const { saveAuth } = useAuth();

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  // Reset field kode kasir saat role berubah
  const handleRoleChange = (e) => {
    setRegForm({ ...regForm, role: e.target.value });
    setKodeKasir("");
    setError("");
  };

  // ── HANDLE LOGIN ─────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email: loginEmail, password: loginPassword });
      saveAuth(res.data.data, res.data.accessToken);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  };

  // ── HANDLE REGISTER ──────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Kalau pilih kasir, validasi kode dulu di frontend
    if (regForm.role === "cashier") {
      if (!kodeKasir) {
        setError("Kode verifikasi kasir wajib diisi.");
        return;
      }
      if (kodeKasir !== KODE_KASIR) {
        setError("Kode verifikasi kasir salah. Hubungi admin.");
        return;
      }
    }

    setLoading(true);
    try {
      await register(regForm);
      setSuccess("Akun berhasil dibuat! Silakan login.");
      setRegForm({ fullname: "", username: "", email: "", password: "", role: "user" });
      setKodeKasir("");
      setTimeout(() => switchMode("login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">✦</span>
          <span className="login-logo-text">FashionStore</span>
        </div>

        {/* Tab Switch */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
            type="button"
          >
            Masuk
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
            type="button"
          >
            Daftar
          </button>
        </div>

        {/* Notifikasi */}
        {error   && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        {/* ── FORM LOGIN ── */}
        {mode === "login" && (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                type="email"
                placeholder="email@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-password-wrap">
                <input
                  className="form-control"
                  type={showLoginPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button type="button" className="toggle-password"
                  onClick={() => setShowLoginPass(!showLoginPass)} tabIndex={-1}>
                  {showLoginPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        )}

        {/* ── FORM REGISTER ── */}
        {mode === "register" && (
          <form className="login-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                className="form-control"
                type="text"
                placeholder="Nama lengkap"
                value={regForm.fullname}
                onChange={(e) => setRegForm({ ...regForm, fullname: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                className="form-control"
                type="text"
                placeholder="username"
                value={regForm.username}
                onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                type="email"
                placeholder="email@example.com"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-password-wrap">
                <input
                  className="form-control"
                  type={showRegPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  required
                />
                <button type="button" className="toggle-password"
                  onClick={() => setShowRegPass(!showRegPass)} tabIndex={-1}>
                  {showRegPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Pilihan Role — tanpa Admin */}
            <div className="form-group">
              <label>Daftar sebagai</label>
              <select
                className="form-control"
                value={regForm.role}
                onChange={handleRoleChange}
              >
                <option value="user">User</option>
                <option value="cashier">Kasir</option>
              </select>
            </div>

            {/* Field kode verifikasi — hanya muncul kalau pilih Kasir */}
            {regForm.role === "cashier" && (
              <div className="form-group kode-kasir-wrap">
                <label>Kode Verifikasi Kasir</label>
                <div className="input-password-wrap">
                  <input
                    className="form-control"
                    type={showKodeKasir ? "text" : "password"}
                    placeholder="Masukkan kode dari admin"
                    value={kodeKasir}
                    onChange={(e) => setKodeKasir(e.target.value)}
                    required
                  />
                  <button type="button" className="toggle-password"
                    onClick={() => setShowKodeKasir(!showKodeKasir)} tabIndex={-1}>
                    {showKodeKasir ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <p className="kode-hint">Hubungi admin untuk mendapatkan kode verifikasi.</p>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Memproses..." : "Daftar Akun"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
