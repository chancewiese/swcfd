// src/router.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";

// Import existing pages
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventPage from "./pages/EventPage";
import EditEventPage from "./pages/EditEventPage";
import AccountPage from "./pages/AccountPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import SponsorsPage from "./pages/SponsorsPage";
import GalleryPage from "./pages/GalleryPage";

// Import dedicated event pages
import PickleballPage from "./pages/PickleballPage";
import PickleballRegistrationPage from "./pages/PickleballRegistrationPage";

// Import auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

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

      {/* Special dedicated event pages */}
      <Route
        path="/events/pickleball"
        element={
          <Layout>
            <PickleballPage />
          </Layout>
        }
      />

      {/* Dynamic event route (used for most events) */}
      <Route
        path="/events/:slug"
        element={
          <Layout>
            <EventPage />
          </Layout>
        }
      />

      {/* Event editing route */}
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

      {/* Pickleball Registration */}
      <Route
        path="/register/pickleball"
        element={
          <Layout>
            <PickleballRegistrationPage />
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
            <GalleryPage />
          </Layout>
        }
      />
      <Route
        path="/sponsors"
        element={
          <Layout>
            <SponsorsPage />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <AboutPage />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <ContactPage />
          </Layout>
        }
      />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/account" replace state={{ from: location }} />
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
            <Navigate to="/account" replace state={{ from: location }} />
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
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Layout>
              <AccountPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
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
