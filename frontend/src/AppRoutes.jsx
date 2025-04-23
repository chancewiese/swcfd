// frontend/src/AppRoutes.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

// Layout
import MainLayout from "./layouts/MainLayout";

// Auth Pages
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ForgotPassword from "./components/auth/ForgotPassword";
import PasswordReset from "./components/auth/PasswordReset";

// User Pages
import Dashboard from "./pages/Dashboard";
import UserProfile from "./components/user/UserProfile";
import FamilyManagement from "./components/family/FamilyManagement";

// Public Pages
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventPage from "./pages/EventPage";

// Protected route component
const ProtectedRoute = ({ children, auth, redirectPath = "/login" }) => {
  if (auth.loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Admin-only route component
const AdminRoute = ({ children, auth, redirectPath = "/dashboard" }) => {
  if (auth.loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!auth.isAuthenticated || !auth.user?.roles?.includes("admin")) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const navigate = useNavigate();

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      // If no token, user is not authenticated
      if (!token) {
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        return;
      }

      try {
        // Fetch user data with token
        const res = await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAuth({
          isAuthenticated: true,
          user: res.data.data,
          loading: false,
        });
      } catch (err) {
        // If token is invalid or expired, clear it
        console.error("Auth check error:", err);
        localStorage.removeItem("token");

        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  // Configure axios to include token in all requests
  useEffect(() => {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle 401 responses (unauthorized)
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear token and auth state
          localStorage.removeItem("token");
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );
  }, [navigate]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <MainLayout auth={auth} setAuth={setAuth}>
            <HomePage />
          </MainLayout>
        }
      />

      <Route
        path="/events"
        element={
          <MainLayout auth={auth} setAuth={setAuth}>
            <EventsPage />
          </MainLayout>
        }
      />

      <Route
        path="/events/:slug"
        element={
          <MainLayout auth={auth} setAuth={setAuth}>
            <EventPage />
          </MainLayout>
        }
      />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <MainLayout auth={auth} setAuth={setAuth}>
              <LoginForm setAuth={setAuth} />
            </MainLayout>
          )
        }
      />

      <Route
        path="/register"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <MainLayout auth={auth} setAuth={setAuth}>
              <RegisterForm setAuth={setAuth} />
            </MainLayout>
          )
        }
      />

      <Route
        path="/forgot-password"
        element={
          <MainLayout auth={auth} setAuth={setAuth}>
            <ForgotPassword />
          </MainLayout>
        }
      />

      <Route
        path="/reset-password/:resettoken"
        element={
          <MainLayout auth={auth} setAuth={setAuth}>
            <PasswordReset />
          </MainLayout>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute auth={auth}>
            <MainLayout auth={auth} setAuth={setAuth}>
              <Dashboard auth={auth} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute auth={auth}>
            <MainLayout auth={auth} setAuth={setAuth}>
              <UserProfile auth={auth} setAuth={setAuth} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/family"
        element={
          <ProtectedRoute auth={auth}>
            <MainLayout auth={auth} setAuth={setAuth}>
              <FamilyManagement auth={auth} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/users"
        element={
          <AdminRoute auth={auth}>
            <MainLayout auth={auth} setAuth={setAuth}>
              <div>Admin Users Management Page (To be implemented)</div>
            </MainLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/families"
        element={
          <AdminRoute auth={auth}>
            <MainLayout auth={auth} setAuth={setAuth}>
              <div>Admin Families Management Page (To be implemented)</div>
            </MainLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/events"
        element={
          <AdminRoute auth={auth}>
            <MainLayout auth={auth} setAuth={setAuth}>
              <div>Admin Events Management Page (To be implemented)</div>
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* Catch All Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
