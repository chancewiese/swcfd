// src/Router.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";

// Import pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import EventsPage from "./pages/EventsPage";
import ContactPage from "./pages/ContactPage";
import GalleryPage from "./pages/GalleryPage";
import SponsorsPage from "./pages/SponsorsPage";
import CalendarPage from "./pages/CalendarPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import MyRegistrationsPage from "./pages/MyRegistrationsPage";

// Import event pages (if available)
import GolfPage from "./pages/events/GolfPage";
import PickleballPage from "./pages/events/PickleballPage";

// Import protected route component
import ProtectedRoute from "./components/auth/ProtectedRoute";

const Router = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
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
        path="/events"
        element={
          <Layout>
            <EventsPage />
          </Layout>
        }
      />
      <Route
        path="/events/golf"
        element={
          <Layout>
            <GolfPage />
          </Layout>
        }
      />
      <Route
        path="/events/pickleball"
        element={
          <Layout>
            <PickleballPage />
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
        path="/calendar"
        element={
          <Layout>
            <CalendarPage />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout>
            <LoginPage />
          </Layout>
        }
      />
      <Route
        path="/signup"
        element={
          <Layout>
            <SignupPage />
          </Layout>
        }
      />

      {/* User account pages */}
      <Route
        path="/profile"
        element={
          <Layout>
            <ProfilePage />
          </Layout>
        }
      />
      <Route
        path="/my-registrations"
        element={
          <Layout>
            <MyRegistrationsPage />
          </Layout>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <Layout>
            <ProtectedRoute requireAdmin={true}>
              <div>Admin Dashboard (To be implemented)</div>
            </ProtectedRoute>
          </Layout>
        }
      />

      {/* Add a fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
