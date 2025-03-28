// src/components/layout/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import SidebarNav from "./SidebarNav";

const Header = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <header className="navbar">
        <Link to="/" className="navbar-brand">
          Country Fair Days
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-nav desktop-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/events" className="nav-link">
            Events
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/gallery" className="nav-link">
            Gallery
          </Link>
          <Link to="/sponsors" className="nav-link">
            Sponsors
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
        </nav>

        <div className="navbar-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              {user.isAdmin && (
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              )}
              <Link to="/logout" className="nav-link">
                Logout
              </Link>
            </div>
          ) : (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          )}

          <button className="mobile-menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <SidebarNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Header;
