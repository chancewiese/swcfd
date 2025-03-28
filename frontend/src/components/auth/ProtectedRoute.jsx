// src/components/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading, error } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p className="auth-loading-text">Verifying authentication...</p>
      </div>
    );
  }

  // Show any auth errors
  if (error && !isAuthenticated) {
    return (
      <div className="auth-loading-container">
        <p className="auth-error-message">{error}</p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="btn btn-primary mt-3"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check admin rights if required
  if (requireAdmin && !isAdmin) {
    return (
      <div className="auth-loading-container">
        <p className="auth-error-message">Admin privileges required</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="btn btn-primary mt-3"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Render children if all checks pass
  return children;
};

export default ProtectedRoute;
