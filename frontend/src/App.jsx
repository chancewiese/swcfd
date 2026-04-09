// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import Router from "./router";
import ThemeProvider from "./theme/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { DevModeProvider } from "./context/DevModeContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DevModeProvider>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </DevModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
