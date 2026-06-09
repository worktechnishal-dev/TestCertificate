import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setResetUrl("");

    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to generate reset link");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Certificate Suite</p>
        <h1>Forgot Password</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          {message && <p className={resetUrl ? "success-text" : "status-text"}>{message}</p>}
          {resetUrl && (
            <Link className="reset-link" to={resetUrl}>
              Open reset password page
            </Link>
          )}
          <button className="button" disabled={saving}>
            {saving ? "Generating..." : "Generate Reset Link"}
          </button>
        </form>
        <p className="auth-switch">
          Remembered it? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
