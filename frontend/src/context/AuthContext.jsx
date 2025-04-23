// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/axiosConfig"; // Import the configured axios instance

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
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setUser(response.data.data);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set up axios interceptors for authentication
  useEffect(() => {
    // Request interceptor to add token to all requests
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle unauthorized responses
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear auth state on unauthorized responses
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptors when component unmounts
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);

      // Update auth state
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);

      // Update auth state
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    }

    return { success: true };
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/users/profile", profileData);

      // Update user state with new data
      setUser((prevUser) => ({
        ...prevUser,
        ...response.data.data,
      }));

      return { success: true, user: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      };
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      const response = await api.put("/auth/update-password", passwordData);

      // Update token if a new one is returned
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update password. Please try again.",
      };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });

      return {
        success: true,
        message: "Password reset email sent",
        resetUrl: response.data.resetUrl, // Only present in development environment
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to send reset email. Please try again.",
      };
    }
  };

  // Reset password
  const resetPassword = async (token, passwordData) => {
    try {
      const response = await api.put(
        `/auth/reset-password/${token}`,
        passwordData
      );

      return { success: true, message: "Password reset successful" };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to reset password. Please try again.",
      };
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  // Value object to be provided to consumers
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
