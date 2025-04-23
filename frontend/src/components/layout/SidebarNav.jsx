// src/components/layout/SidebarNav.jsx
import { Link } from "react-router-dom";
import "./SidebarNav.css";

function SidebarNav({ isOpen, closeSidebar, isAuthenticated, user, onLogout }) {
  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="close-button" onClick={closeSidebar}>
            ✕
          </button>
        </div>
        <nav className="sidebar-nav">
          {/* Public Navigation Links */}
          <Link to="/" onClick={closeSidebar}>
            Home
          </Link>
          <Link to="/events" onClick={closeSidebar}>
            Events
          </Link>
          <Link to="/calendar" onClick={closeSidebar}>
            Event Calendar
          </Link>
          <Link to="/gallery" onClick={closeSidebar}>
            Photo Gallery
          </Link>
          <Link to="/sponsors" onClick={closeSidebar}>
            Sponsors
          </Link>
          <Link to="/about" onClick={closeSidebar}>
            About
          </Link>
          <Link to="/contact" onClick={closeSidebar}>
            Contact
          </Link>

          {/* User authenticated section */}
          {isAuthenticated && (
            <>
              <div className="sidebar-divider"></div>
              <div className="sidebar-section-title">My Account</div>

              <Link to="/dashboard" onClick={closeSidebar}>
                Dashboard
              </Link>
              <Link to="/profile" onClick={closeSidebar}>
                My Profile
              </Link>
              <Link to="/family" onClick={closeSidebar}>
                Family Management
              </Link>
              <Link to="/my-registrations" onClick={closeSidebar}>
                My Registrations
              </Link>

              {/* Admin section */}
              {user?.roles?.includes("admin") && (
                <>
                  <div className="sidebar-divider"></div>
                  <div className="sidebar-section-title">Admin</div>

                  <Link to="/admin/users" onClick={closeSidebar}>
                    Manage Users
                  </Link>
                  <Link to="/admin/families" onClick={closeSidebar}>
                    Manage Families
                  </Link>
                  <Link to="/admin/events" onClick={closeSidebar}>
                    Manage Events
                  </Link>
                </>
              )}

              <div className="sidebar-divider"></div>
              <button
                className="sidebar-logout-button"
                onClick={() => {
                  onLogout();
                  closeSidebar();
                }}
              >
                Logout
              </button>
            </>
          )}

          {/* Auth links for non-authenticated users */}
          {!isAuthenticated && (
            <>
              <div className="sidebar-divider"></div>
              <Link to="/login" onClick={closeSidebar} className="auth-link">
                Login
              </Link>
              <Link to="/register" onClick={closeSidebar} className="auth-link">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>

      {isOpen && <div className="overlay" onClick={closeSidebar}></div>}
    </>
  );
}

export default SidebarNav;
