// src/components/layout/Header.jsx
import { AppBar, Toolbar, Typography, Link } from "@mui/material";
import SidebarNav from "./SidebarNav";
import { Link as RouterLink } from "react-router-dom";

const Header = () => {
  return (
    <AppBar position="sticky">
      <Toolbar sx={{ height: 80 }}>
        <SidebarNav />
        <Link
          component={RouterLink}
          to="/"
          sx={{
            ml: 2,
            textDecoration: "none",
            color: "inherit",
            "&:hover": {
              cursor: "pointer",
            },
          }}
        >
          <Typography variant="h6">South Weber CFD</Typography>
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
