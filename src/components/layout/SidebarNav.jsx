// src/components/layout/SidebarNav.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const SidebarNav = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      <div className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <h2>Menu</h2>
          <button className="drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drawer-content">
          <nav className="sidebar-nav">
            <Link to="/" className="sidebar-nav-item" onClick={onClose}>
              Home
            </Link>
            <Link to="/events" className="sidebar-nav-item" onClick={onClose}>
              Events
            </Link>
            <Link to="/about" className="sidebar-nav-item" onClick={onClose}>
              About
            </Link>
            <Link to="/gallery" className="sidebar-nav-item" onClick={onClose}>
              Gallery
            </Link>
            <Link to="/sponsors" className="sidebar-nav-item" onClick={onClose}>
              Sponsors
            </Link>
            <Link to="/contact" className="sidebar-nav-item" onClick={onClose}>
              Contact
            </Link>

            <div className="sidebar-divider"></div>

            <button
              className="sidebar-nav-item theme-toggle"
              onClick={toggleTheme}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            {user ? (
              <>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="sidebar-nav-item"
                    onClick={onClose}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button className="sidebar-nav-item" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="sidebar-nav-item" onClick={onClose}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="drawer-backdrop visible" onClick={onClose}></div>
      )}
    </>
  );
};

export default SidebarNav;
