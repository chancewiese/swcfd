// src/context/ThemeContext.jsx

// import { useTheme } from '../context/ThemeContext';
// function MyComponent() {
//   const theme = useTheme();

//   return (
//     <div style={{ color: theme.palette.primary.main }}>
//       Themed Content
//     </div>
//   );
// }

import { createContext, useContext } from "react";
import {
   ThemeProvider as MuiThemeProvider,
   createTheme,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export const colorTokens = {
   electric: "#3CC47C", // Bright green
   forest: "#1E392A", // Dark forest green
   light: "#E9C893", // Light beige/sand
   tin: "#828081", // Gray
};

const theme = createTheme({
   palette: {
      primary: {
         main: colorTokens.electric,
         dark: colorTokens.forest,
      },
      secondary: {
         main: colorTokens.light,
         dark: colorTokens.tin,
      },
      background: {
         default: "#ffffff",
         paper: "#f5f5f5",
      },
      text: {
         primary: colorTokens.forest,
         secondary: colorTokens.tin,
      },
   },
   typography: {
      fontFamily:
         '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif',
      h1: {
         fontWeight: 700,
         fontSize: "2.5rem",
      },
      h2: {
         fontWeight: 600,
         fontSize: "2rem",
      },
      h3: {
         fontWeight: 600,
         fontSize: "1.5rem",
      },
      button: {
         textTransform: "none",
      },
   },
   components: {
      MuiButton: {
         styleOverrides: {
            root: {
               borderRadius: 4,
               padding: "8px 24px",
            },
            contained: {
               boxShadow: "none",
               "&:hover": {
                  boxShadow: "none",
               },
            },
         },
      },
      MuiCard: {
         styleOverrides: {
            root: {
               borderRadius: 8,
               boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            },
         },
      },
   },
});

const ThemeContext = createContext(theme);

export const useTheme = () => {
   const context = useContext(ThemeContext);
   if (context === undefined) {
      throw new Error("useTheme must be used within a ThemeProvider");
   }
   return context;
};

export const ThemeProvider = ({ children }) => {
   return (
      <ThemeContext.Provider value={theme}>
         <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
         </MuiThemeProvider>
      </ThemeContext.Provider>
   );
};

export default ThemeProvider;
