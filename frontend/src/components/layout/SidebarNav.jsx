// src/components/layout/SidebarNav.jsx
import "./SidebarNav.css";

function SidebarNav({ isOpen, closeSidebar }) {
  const isLoggedIn = localStorage.getItem("user") !== null;

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
          <a href="/" onClick={closeSidebar}>
            Home
          </a>
          <a href="/events" onClick={closeSidebar}>
            Events
          </a>
          <a href="/calendar" onClick={closeSidebar}>
            Event Calendar
          </a>
          <a href="/gallery" onClick={closeSidebar}>
            Photo Gallery
          </a>
          <a href="/sponsors" onClick={closeSidebar}>
            Sponsors
          </a>
          <a href="/about" onClick={closeSidebar}>
            About
          </a>
          <a href="/contact" onClick={closeSidebar}>
            Contact
          </a>

          <div className="sidebar-divider"></div>

          {isLoggedIn ? (
            <button
              className="sidebar-nav-item"
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/";
                closeSidebar();
              }}
            >
              Sign Out
            </button>
          ) : (
            <>
              <a href="/login" onClick={closeSidebar}>
                Sign In
              </a>
              <a href="/signup" onClick={closeSidebar}>
                Create Account
              </a>
            </>
          )}
        </nav>
      </div>

      {isOpen && <div className="overlay" onClick={closeSidebar}></div>}
    </>
  );
}

export default SidebarNav;
