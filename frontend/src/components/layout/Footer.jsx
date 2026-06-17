import styled from "@emotion/styled";

export function Footer() {
  return (
    <FooterRoot>
      <FooterContainer>
        <Copyright>
          &copy; {new Date().getFullYear()} Country Fair Days. All rights
          reserved.
        </Copyright>
        <FooterLinks>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
        </FooterLinks>
      </FooterContainer>
    </FooterRoot>
  );
}

const FooterRoot = styled.footer`
  background-color: #f5f5f5;
  padding: 1rem;
  margin-top: auto;
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Copyright = styled.p`
  margin: 0;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1rem;

  a {
    color: var(--text-color);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;
