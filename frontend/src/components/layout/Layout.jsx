// src/components/layout/Layout.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import SidebarNav from "./SidebarNav";
import { LayoutContext } from "../../context/LayoutContext";
import "./Layout.css";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // Hero / header transparency state
  const [hasHero, setHasHero] = useState(false);
  const [heroScrollThreshold, setHeroScrollThreshold] = useState(400);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  // Scroll listener — updates whenever threshold changes
  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > heroScrollThreshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check immediately in case page is already scrolled
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroScrollThreshold]);

  // Reset when leaving a hero page
  useEffect(() => {
    if (!hasHero) {
      setScrolledPastHero(false);
    }
  }, [hasHero]);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);
  const handleLogout = async () => { await logout(); };

  const headerTransparent = hasHero && !scrolledPastHero;

  return (
    <LayoutContext.Provider value={{ hasHero, setHasHero, setHeroScrollThreshold }}>
      <div className={`layout${hasHero ? " layout--has-hero" : ""}`}>
        <Header
          toggleSidebar={toggleSidebar}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
          transparent={headerTransparent}
        />
        <SidebarNav
          isOpen={sidebarOpen}
          closeSidebar={closeSidebar}
          isAuthenticated={isAuthenticated}
        />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
}

export default Layout;
