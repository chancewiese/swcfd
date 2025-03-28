// src/components/auth/AuthNavigation.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccountDropdown from "./AccountDropdown";
import "./AuthNavigation.css";

const AuthNavigation = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="auth-nav-loading">Loading...</div>;
  }

  return (
    <div className="auth-navigation">
      {isAuthenticated ? (
        <AccountDropdown />
      ) : (
        <>
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
          <Link to="/signup" className="auth-link signup-link">
            Create Account
          </Link>
        </>
      )}
    </div>
  );
};

export default AuthNavigation;
