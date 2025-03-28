// src/components/auth/AccountDropdown.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AccountDropdown.css";

const AccountDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="account-dropdown" ref={dropdownRef}>
      <button
        className="account-button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        {user?.name || "Account"} <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="user-email">{user?.email}</p>
          </div>

          <div className="dropdown-items">
            <Link
              to="/profile"
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>

            <Link
              to="/my-registrations"
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              My Registrations
            </Link>

            {user?.isAdmin && (
              <Link
                to="/admin"
                className="dropdown-item admin-item"
                onClick={() => setIsOpen(false)}
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
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
