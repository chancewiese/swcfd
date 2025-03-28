// src/components/layout/Header.jsx
import { Link } from "react-router-dom";
import "./Header.css";

function Header({ toggleSidebar }) {
  return (
    <header className="header">
      <div className="header-container">
        <button className="hamburger-button" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="site-title">
          <Link to="/">Country Fair Days</Link>
        </h1>
        <nav className="desktop-nav">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/sponsors">Sponsors</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/login">Sign In</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
