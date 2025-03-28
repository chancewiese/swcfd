// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simple placeholder functions for authentication
  const login = async (credentials) => {
    // Placeholder login logic (not implemented)
    console.log("Login attempted with:", credentials);
    return { success: false, message: "Login not implemented yet" };
  };

  const logout = async () => {
    // Placeholder logout logic
    setUser(null);
    setIsAuthenticated(false);
    return { success: true };
  };

  // Value object to be provided to consumers
  const value = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
