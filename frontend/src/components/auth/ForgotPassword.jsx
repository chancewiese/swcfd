// frontend/src/components/auth/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState(""); // For development environment only

  const onChange = (e) => {
    setEmail(e.target.value);
  };

  const onSubmit = async (e) => {
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
      const res = await axios.post("/api/auth/forgot-password", { email });

      setSuccess(true);

      // If in development mode, capture the reset link for testing
      if (process.env.NODE_ENV === "development" && res.data.resetUrl) {
        setResetLink(res.data.resetUrl);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to process request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Forgot Your Password?</h2>
      <p>
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {success ? (
        <div className="password-reset-success">
          <div className="alert alert-success">
            Password reset email sent! Please check your inbox and follow the
            instructions to reset your password.
          </div>

          {resetLink && (
            <div className="dev-reset-link">
              <p>
                <strong>Development Environment:</strong> In production, an
                email would be sent. For testing purposes, here's the reset
                link:
              </p>
              <a href={resetLink} className="reset-link">
                {resetLink}
              </a>
            </div>
          )}

          <div className="auth-links">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <div className="auth-links">
            <p>
              Remember your password? <Link to="/login">Login</Link>
            </p>
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
