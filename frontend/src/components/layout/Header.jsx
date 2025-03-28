// src/components/layout/Header.jsx
import { Link } from "react-router-dom";
import "./Header.css";

function Header({ toggleSidebar }) {
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
      </div>
    </header>
  );
}

export default Header;
