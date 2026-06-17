import { Link } from "react-router-dom";
import styled from "@emotion/styled";

export function SidebarNav({ isOpen, closeSidebar, isAuthenticated }) {
  return (
    <>
      <SidebarRoot isOpen={isOpen}>
        <SidebarHeader>
          <h2>Menu</h2>
          <CloseButton onClick={closeSidebar}>✕</CloseButton>
        </SidebarHeader>
        <NavLinks>
          <Link to="/" onClick={closeSidebar}>Home</Link>
          <Link to="/events" onClick={closeSidebar}>Events</Link>
          <Link to="/calendar" onClick={closeSidebar}>Event Calendar</Link>
          <Link to="/gallery" onClick={closeSidebar}>Photo Gallery</Link>
          <Link to="/sponsors" onClick={closeSidebar}>Sponsors</Link>
          <Link to="/about" onClick={closeSidebar}>About</Link>
          <Link to="/contact" onClick={closeSidebar}>Contact</Link>
        </NavLinks>
      </SidebarRoot>

      {isOpen && <Overlay onClick={closeSidebar} />}
    </>
  );
}

const SidebarRoot = styled("div", {
  shouldForwardProp: (p) => p !== "isOpen",
})`
  position: fixed;
  top: 0;
  left: ${({ isOpen }) => (isOpen ? "0" : "-280px")};
  width: 280px;
  height: 100%;
  background-color: white;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 1000;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background-color: var(--primary-color);
  color: white;

  h2 {
    margin: 0;
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
`;

const NavLinks = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;

  a {
    padding: 0.75rem 1rem;
    color: var(--text-color);
    text-decoration: none;
    border-bottom: 1px solid #eee;
    display: block;
    transition:
      background-color 0.2s,
      color 0.2s;
    border-radius: 4px;
    font-weight: 500;
  }

  a:hover {
    background-color: #f5f5f5;
    color: var(--primary-color);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;
