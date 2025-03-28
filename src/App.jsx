// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import Router from "./components/layout/Router";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import ThemeProvider from "./context/ThemeContext";

const App = () => (
  <ThemeProvider>
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
