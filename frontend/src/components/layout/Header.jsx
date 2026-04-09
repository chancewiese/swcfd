// src/components/layout/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useDevMode } from "../../context/DevModeContext";

function Header({ toggleSidebar, isAuthenticated, user, transparent }) {
  const navigate = useNavigate();
  const { devMode, toggleDevMode } = useDevMode();

  const isAdmin = user?.roles?.includes("admin");

  const handleAccountClick = () => {
    navigate("/account");
  };

  return (
    <header className={`header${transparent ? " header--transparent" : ""}`}>
      <div className="header-container">
        <div className="header-left">
          <IconButton
            onClick={toggleSidebar}
            aria-label="menu"
            sx={{
              color: "white",
              marginRight: "1rem",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            <MenuIcon sx={{ fontSize: "1.75rem" }} />
          </IconButton>
          <h1 className="site-title">
            <Link to="/">Country Fair Days</Link>
          </h1>
        </div>

        <div className="header-right">
          {isAuthenticated && isAdmin && (
            <button
              className={`dev-toggle${devMode ? " dev-toggle--active" : ""}`}
              onClick={toggleDevMode}
              title={devMode ? "Dev mode on — click to disable" : "Dev mode off — click to enable"}
            >
              <span className="dev-toggle-track">
                <span className="dev-toggle-thumb" />
              </span>
              <span className="dev-toggle-label">Dev</span>
            </button>
          )}
          {isAuthenticated ? (
            <button className="account-button" onClick={handleAccountClick}>
              <div className="avatar-circle">
                {user?.firstName ? user.firstName.charAt(0) : "U"}
              </div>
              <span className="account-name">Account</span>
            </button>
          ) : (
            <>
              <Link to="/login" className="login-button">
                Login
              </Link>
              <Link to="/register" className="register-button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
