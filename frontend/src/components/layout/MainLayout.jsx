// frontend/src/layouts/MainLayout.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const MainLayout = ({ children, auth, setAuth }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      // Call logout endpoint
      await axios.get("/api/auth/logout", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Clear token from localStorage
      localStorage.removeItem("token");

      // Reset auth state
      setAuth({
        isAuthenticated: false,
        user: null,
        loading: false,
      });

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);

      // Even if the API call fails, still log out locally
      localStorage.removeItem("token");
      setAuth({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
      navigate("/login");
    }
  };

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <button
            className="hamburger-button"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className="site-title">
            <Link to="/">Country Fair Days</Link>
          </h1>
          {auth.isAuthenticated && (
            <div className="user-info">
              <span className="welcome-text">
                Welcome, {auth.user?.firstName || "User"}
              </span>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button
            className="close-button"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/calendar">Event Calendar</Link>
          <Link to="/gallery">Photo Gallery</Link>
          <Link to="/sponsors">Sponsors</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>

          {auth.isAuthenticated ? (
            <>
              <div className="nav-divider"></div>
              <h3>Account</h3>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/profile">My Profile</Link>
              <Link to="/family">Family Management</Link>
              <Link to="/my-registrations">My Registrations</Link>

              {auth.user?.roles?.includes("admin") && (
                <>
                  <div className="nav-divider"></div>
                  <h3>Admin</h3>
                  <Link to="/admin/users">Manage Users</Link>
                  <Link to="/admin/families">Manage Families</Link>
                  <Link to="/admin/events">Manage Events</Link>
                </>
              )}

              <div className="nav-divider"></div>
              <button className="sidebar-logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="nav-divider"></div>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>

      {/* Overlay for when sidebar is open */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Country Fair Days. All rights
            reserved.
          </p>
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
