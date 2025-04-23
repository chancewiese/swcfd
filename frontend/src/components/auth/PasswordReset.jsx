// frontend/src/components/auth/PasswordReset.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const PasswordReset = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { resettoken } = useParams();
  const navigate = useNavigate();

  // Check if token is valid on component mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Just check if token exists in params
        if (!resettoken) {
          setValidToken(false);
          setTokenChecked(true);
          return;
        }

        // In a real application, you might want to validate the token on the server
        // but for simplicity, we're just checking it exists for now
        setValidToken(true);
        setTokenChecked(true);
      } catch (err) {
        setValidToken(false);
        setTokenChecked(true);
        setError("Invalid or expired password reset token");
      }
    };

    checkToken();
  }, [resettoken]);

  const { password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(`/api/auth/reset-password/${resettoken}`, {
        password,
        confirmPassword,
      });

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return <div className="loading">Checking token validity...</div>;
  }

  if (!validToken) {
    return (
      <div className="auth-form-container">
        <h2>Password Reset Failed</h2>
        <div className="alert alert-danger">
          Invalid or expired password reset token. Please request a new password
          reset link.
        </div>
        <div className="auth-links">
          <Link to="/forgot-password">Request New Reset Link</Link>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-form-container">
        <h2>Password Reset Successful</h2>
        <div className="alert alert-success">
          Your password has been reset successfully! You will be redirected to
          the login page in a few seconds.
        </div>
        <div className="auth-links">
          <Link to="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <h2>Reset Your Password</h2>
      <p>Please enter your new password below.</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
            placeholder="Enter new password"
          />
          <small className="form-text text-muted">
            Password must be at least 6 characters long
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            required
            minLength="6"
            placeholder="Confirm new password"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Resetting Password..." : "Reset Password"}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default PasswordReset;
