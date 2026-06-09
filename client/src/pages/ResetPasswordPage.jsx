import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { data } = await api.post("/auth/reset-password", { token, password });
      navigate("/login", {
        replace: true,
        state: {
          notice: data.message
        }
      });
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Certificate Suite</p>
        <h1>Reset Password</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>New Password</label>
            <div className="password-control">
              <input
                type={showPassword ? "text" : "password"}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {message && <p className="error-text">{message}</p>}
          <button className="button" disabled={saving}>
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
        <p className="auth-switch">
          Back to <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
