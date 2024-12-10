// src/contexts/AuthContext.jsx
import { createContext, useState, useContext } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    const response = await axios.get("http://localhost:3000/admin");
    const { admin } = response.data;

    if (email === admin.username && password === admin.password) {
      const userData = { email, isAdmin: true };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
