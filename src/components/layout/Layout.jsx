// src/components/layout/Layout.jsx
import { Box } from "@mui/material";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <Box>
      <Header />
      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
};

export default Layout;
