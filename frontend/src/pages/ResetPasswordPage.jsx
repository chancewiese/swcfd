// src/pages/ResetPasswordPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./auth/Auth.css";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true); // Assume token is valid initially

  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError("Invalid password reset token");
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, formData);

      if (result.success) {
        setSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
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

  // If token is invalid, show error message
  if (!validToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Password Reset Failed</h1>
          <div className="auth-error">
            Invalid or expired password reset token. Please request a new
            password reset link.
          </div>
          <div className="auth-footer">
            <Link to="/forgot-password" className="auth-button">
              Request New Reset Link
            </Link>
            <p className="mt-3">
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If password reset was successful, show success message
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Password Reset Successful</h1>
          <div className="auth-success">
            Your password has been reset successfully! You will be redirected to
            the login page in a moment.
          </div>
          <div className="auth-footer">
            <Link to="/login" className="auth-button">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Enter your new password</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter new password"
              minLength="6"
              disabled={loading}
            />
            <small className="form-text">
              Password must be at least 6 characters long
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm new password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

          <div className="auth-footer">
            <p>
              Remember your password? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
