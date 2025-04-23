// src/components/layout/Layout.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import SidebarNav from "./SidebarNav";
import "./Layout.css";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Get authentication state from context
  const { isAuthenticated, user, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Handle user logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="layout">
      <Header
        toggleSidebar={toggleSidebar}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
      <SidebarNav
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
