// src/router.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";

// Import existing pages
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventPage from "./pages/EventPage";
import EditEventPage from "./pages/EditEventPage";

// Import auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Import user pages
// import ProfilePage from "./pages/ProfilePage";
import FamilyPage from "./pages/FamilyPage";
// import DashboardPage from "./pages/DashboardPage";

// Import auth middleware
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Empty placeholder component for pages that aren't implemented yet
const PlaceholderPage = ({ title }) => (
  <div style={{ textAlign: "center", padding: "2rem" }}>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

const Router = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If authentication is still loading, show a loading indicator
  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>Loading...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/events"
        element={
          <Layout>
            <EventsPage />
          </Layout>
        }
      />
      <Route
        path="/events/:slug"
        element={
          <Layout>
            <EventPage />
          </Layout>
        }
      />
      <Route
        path="/calendar"
        element={
          <Layout>
            <PlaceholderPage title="Event Calendar" />
          </Layout>
        }
      />
      <Route
        path="/gallery"
        element={
          <Layout>
            <PlaceholderPage title="Photo Gallery" />
          </Layout>
        }
      />
      <Route
        path="/sponsors"
        element={
          <Layout>
            <PlaceholderPage title="Sponsors" />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <PlaceholderPage title="About Us" />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <PlaceholderPage title="Contact Us" />
          </Layout>
        }
      />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace state={{ from: location }} />
          ) : (
            <Layout>
              <LoginPage />
            </Layout>
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace state={{ from: location }} />
          ) : (
            <Layout>
              <RegisterPage />
            </Layout>
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Layout>
            <ForgotPasswordPage />
          </Layout>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <Layout>
            <ResetPasswordPage />
          </Layout>
        }
      />

      {/* Protected Routes */}
      {/* <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/family"
        element={
          <ProtectedRoute>
            <Layout>
              <FamilyPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/edit/:slug"
        element={
          <ProtectedRoute>
            <Layout>
              <EditEventPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes (can add more later) */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireAdmin={true}>
            <Layout>
              <PlaceholderPage title="Admin Dashboard" />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Add a fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
