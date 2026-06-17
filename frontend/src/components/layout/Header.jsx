import { Link, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useDevMode } from "../../context/DevModeContext";

export function Header({ toggleSidebar, isAuthenticated, user, transparent }) {
  const navigate = useNavigate();
  const { devMode, toggleDevMode } = useDevMode();

  const isAdmin = user?.roles?.includes("admin");

  return (
    <HeaderRoot transparent={transparent}>
      <HeaderContainer>
        <HeaderLeft>
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
          <SiteTitle>
            <Link to="/">Country Fair Days</Link>
          </SiteTitle>
        </HeaderLeft>

        <HeaderRight>
          {isAuthenticated && isAdmin && (
            <DevToggle
              active={devMode}
              onClick={toggleDevMode}
              title={
                devMode
                  ? "Dev mode on — click to disable"
                  : "Dev mode off — click to enable"
              }
            >
              <DevToggleTrack active={devMode}>
                <DevToggleThumb active={devMode} />
              </DevToggleTrack>
              <DevToggleLabel>Dev</DevToggleLabel>
            </DevToggle>
          )}
          {isAuthenticated ? (
            <AccountButton onClick={() => navigate("/account")}>
              <AvatarCircle>
                {user?.firstName ? user.firstName.charAt(0) : "U"}
              </AvatarCircle>
              <AccountName>Account</AccountName>
            </AccountButton>
          ) : (
            <>
              <LoginButton to="/login">Login</LoginButton>
              <RegisterButton to="/register" transparent={transparent}>
                Register
              </RegisterButton>
            </>
          )}
        </HeaderRight>
      </HeaderContainer>
    </HeaderRoot>
  );
}

const HeaderRoot = styled("header", {
  shouldForwardProp: (p) => p !== "transparent",
})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: ${({ transparent }) =>
    transparent ? "rgba(0, 0, 0, 0.28)" : "var(--primary-color)"};
  padding: 1rem;
  color: white;
  box-shadow: ${({ transparent }) =>
    transparent ? "none" : "0 2px 8px rgba(0, 0, 0, 0.15)"};
  backdrop-filter: ${({ transparent }) =>
    transparent ? "blur(3px)" : "none"};
  -webkit-backdrop-filter: ${({ transparent }) =>
    transparent ? "blur(3px)" : "none"};
  transition:
    background-color 0.35s ease,
    box-shadow 0.35s ease,
    backdrop-filter 0.35s ease;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SiteTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;

  a,
  a:visited {
    color: white;
    text-decoration: none;
  }

  a:hover {
    color: white;
    text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
  }
`;

const AccountButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const AvatarCircle = styled.div`
  width: 2rem;
  height: 2rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const AccountName = styled.span`
  font-weight: 500;

  @media (max-width: 600px) {
    display: none;
  }
`;

const BaseNavLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  min-height: 2.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1;
  border: 1px solid transparent;
  box-sizing: border-box;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  @media (max-width: 600px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
  }
`;

const LoginButton = styled(BaseNavLink)`
  color: white;
  background-color: rgba(255, 255, 255, 0.1);

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const RegisterButton = styled(BaseNavLink, {
  shouldForwardProp: (p) => p !== "transparent",
})`
  color: ${({ transparent }) => (transparent ? "white" : "var(--primary-color)")};
  background-color: ${({ transparent }) =>
    transparent ? "rgba(255, 255, 255, 0.2)" : "white"};
  border-color: ${({ transparent }) =>
    transparent ? "rgba(255, 255, 255, 0.5)" : "transparent"};

  &:hover {
    background-color: ${({ transparent }) =>
      transparent ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.9)"};
  }
`;

const DevToggle = styled("button", {
  shouldForwardProp: (p) => p !== "active",
})`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: 1px solid
    ${({ active }) => (active ? "#4ade80" : "rgba(255, 255, 255, 0.3)")};
  border-radius: 4px;
  color: ${({ active }) => (active ? "#4ade80" : "rgba(255, 255, 255, 0.6)")};
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  &:hover {
    border-color: ${({ active }) =>
      active ? "#86efac" : "rgba(255, 255, 255, 0.6)"};
    color: ${({ active }) => (active ? "#86efac" : "rgba(255, 255, 255, 0.9)")};
  }
`;

const DevToggleTrack = styled("span", {
  shouldForwardProp: (p) => p !== "active",
})`
  display: inline-flex;
  align-items: center;
  width: 1.75rem;
  height: 1rem;
  background: ${({ active }) =>
    active ? "#4ade80" : "rgba(255, 255, 255, 0.2)"};
  border-radius: 9999px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
`;

const DevToggleThumb = styled("span", {
  shouldForwardProp: (p) => p !== "active",
})`
  position: absolute;
  left: 0.15rem;
  width: 0.7rem;
  height: 0.7rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  transform: ${({ active }) =>
    active ? "translateX(0.75rem)" : "translateX(0)"};
`;

const DevToggleLabel = styled.span`
  line-height: 1;
`;
