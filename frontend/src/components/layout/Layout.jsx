// src/components/layout/Layout.jsx
import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SidebarNav from "./SidebarNav";
import "./Layout.css";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">
      <Header toggleSidebar={toggleSidebar} />
      <SidebarNav isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
