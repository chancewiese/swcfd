// src/theme/ThemeProvider.jsx
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#0b2447", // Summer night - deep navy
      light: "#2a4a78",
      dark: "#061831",
    },
    secondary: {
      main: "#ff7a18", // warm accent / sunset orange
      light: "#ff9a4a",
      dark: "#c85b00",
    },
    tertiary: {
      main: "#F6C84C", // sunflower yellow (tertiary)
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
    },
    text: {
      primary: "#111827",
    },
    background: {
      default: "#fffdf8",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Arial", sans-serif', // Match your existing font family
    h1: {
      fontWeight: 500,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 500,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 500,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Prevents uppercase text in buttons
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 16,
        },
      },
    },
  },
});

export default function ThemeProvider({ children }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline /> {/* Provides a consistent baseline CSS */}
      {children}
    </MuiThemeProvider>
  );
}
