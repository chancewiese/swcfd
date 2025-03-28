// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Configure axios with credentials for cookies
axios.defaults.withCredentials = true;

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/me`);
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (err) {
        // If 401, user is not authenticated - this is normal
        if (err.response && err.response.status !== 401) {
          setError("Failed to check authentication status");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [API_URL]);

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/users/register`, userData);

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password,
      });

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/users/logout`);
      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Logout failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`${API_URL}/users/profile`, userData);

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Profile update failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
