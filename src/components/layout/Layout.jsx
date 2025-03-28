// src/components/layout/Layout.jsx
import { Link } from "react-router-dom";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="page-container">
      <Header />

      <main className="main-content">{children}</main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} Country Fair Days. All rights
            reserved.
          </div>
          <ul className="footer-links">
            <li className="footer-link">
              <Link to="/about">About</Link>
            </li>
            <li className="footer-link">
              <Link to="/contact">Contact</Link>
            </li>
            <li className="footer-link">
              <Link to="/privacy">Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
