import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import Router from "./components/layout/Router";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import ThemeProvider from "./contexts/ThemeContext";

const App = () => (
  <ThemeProvider>
    <CssBaseline />
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Router />
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
