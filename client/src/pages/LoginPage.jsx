import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const destination = location.state?.from?.pathname || "/";

  if (user) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await login(form);
      navigate(destination, { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to login");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Certificate Suite</p>
        <h1>Login</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(event) => setForm({ ...form, remember: event.target.checked })}
            />
            Remember me
          </label>
          {message && <p className="error-text">{message}</p>}
          <button className="button" disabled={saving}>
            {saving ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-switch">
          New user? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
