// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * A wrapper component for routes that require authentication
 *
 * @param {Object} props
 * @param {boolean} props.requireAdmin - Whether the route requires admin privileges
 * @param {React.ReactNode} props.children - The component to render if authenticated
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ requireAdmin = false, children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show nothing (or could show a spinner)
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the location the user was trying to access for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin privileges required, check user roles
  if (requireAdmin && (!user.roles || !user.roles.includes("admin"))) {
    // If user doesn't have admin role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated (and has admin role if required), render the children
  return children;
};

export default ProtectedRoute;
