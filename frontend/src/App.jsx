// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import Router from "./router";
import ThemeProvider from "./theme/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
