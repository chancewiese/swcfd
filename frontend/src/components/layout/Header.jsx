// src/components/layout/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

function Header({ toggleSidebar, isAuthenticated, user }) {
  const navigate = useNavigate();

  const handleAccountClick = () => {
    navigate("/account");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button className="hamburger-button" onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className="site-title">
            <Link to="/">Country Fair Days</Link>
          </h1>
        </div>

        <div className="header-right">
          {isAuthenticated ? (
            <button className="account-button" onClick={handleAccountClick}>
              <div className="avatar-circle">
                {user?.firstName ? user.firstName.charAt(0) : "U"}
              </div>
              <span className="account-name">Account</span>
            </button>
          ) : (
            <>
              <Link to="/login" className="login-button">
                Login
              </Link>
              <Link to="/register" className="register-button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
