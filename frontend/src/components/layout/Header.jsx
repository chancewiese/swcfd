// src/components/layout/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

function Header({ toggleSidebar }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest(".account-dropdown") && dropdownOpen) {
      setDropdownOpen(false);
    }
  };

  // Add event listener for clicking outside
  if (typeof window !== "undefined") {
    window.addEventListener("click", handleClickOutside);
  }

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

        <nav className="desktop-nav">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/sponsors">Sponsors</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="auth-navigation">
          {isAuthenticated ? (
            <div className="account-dropdown">
              <button className="account-button" onClick={toggleDropdown}>
                {user?.firstName || "Account"}{" "}
                <span className="dropdown-caret">▼</span>
              </button>

              {dropdownOpen && (
                <div className="account-dropdown-menu">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/my-registrations"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Registrations
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      to="/admin"
                      className="dropdown-item admin-link"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-button">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
