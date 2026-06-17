import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useAuth } from "../../context/AuthContext";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SidebarNav } from "./SidebarNav";
import { LayoutContext } from "../../context/LayoutContext";

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const [hasHero, setHasHero] = useState(false);
  const [heroScrollThreshold, setHeroScrollThreshold] = useState(400);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > heroScrollThreshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroScrollThreshold]);

  useEffect(() => {
    if (!hasHero) setScrolledPastHero(false);
  }, [hasHero]);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);
  const handleLogout = async () => { await logout(); };

  const headerTransparent = hasHero && !scrolledPastHero;

  return (
    <LayoutContext.Provider value={{ hasHero, setHasHero, setHeroScrollThreshold }}>
      <LayoutRoot>
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
        <MainContent hasHero={hasHero}>{children}</MainContent>
        <Footer />
      </LayoutRoot>
    </LayoutContext.Provider>
  );
}

const LayoutRoot = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled("main", {
  shouldForwardProp: (p) => p !== "hasHero",
})`
  flex: 1;
  padding: 1rem;
  padding-top: ${({ hasHero }) =>
    hasHero ? "0" : "calc(var(--header-height) + 1rem)"};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0.75rem;
    padding-top: ${({ hasHero }) =>
      hasHero ? "0" : "calc(var(--header-height) + 0.75rem)"};
  }
`;
