// src/components/layout/SidebarNav.jsx
import { Link } from "react-router-dom";
import "./SidebarNav.css";

function SidebarNav({ isOpen, closeSidebar }) {
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
        </nav>
      </div>

      {isOpen && <div className="overlay" onClick={closeSidebar}></div>}
    </>
  );
}

export default SidebarNav;
