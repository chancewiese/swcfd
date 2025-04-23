// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./auth/Auth.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState(""); // For development only

  const { forgotPassword } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setResetLink("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSuccess(true);

        // For development environment only - store the reset URL
        if (process.env.NODE_ENV === "development" && result.resetUrl) {
          setResetLink(result.resetUrl);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to reset your password</p>

        {error && <div className="auth-error">{error}</div>}

        {success ? (
          <div className="password-reset-success">
            <div className="auth-success">
              Password reset email sent! Please check your inbox and follow the
              instructions to reset your password.
            </div>

            {resetLink && (
              <div className="dev-reset-link">
                <p className="dev-note">
                  <strong>Development Environment:</strong> In production, an
                  email would be sent. For testing purposes, here's the reset
                  link:
                </p>
                <a
                  href={resetLink}
                  className="reset-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resetLink}
                </a>
              </div>
            )}

            <div className="auth-footer">
              <Link to="/login" className="auth-button button-secondary">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="auth-footer">
              <p>
                Remember your password? <Link to="/login">Sign In</Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
