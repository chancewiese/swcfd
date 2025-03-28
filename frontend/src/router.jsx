<Route
  path="/events/:slug"
  element={
    <Layout>
      <EventPage />
    </Layout>
  }
/>; // src/router.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";

// Import pages
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventPage from "./pages/EventPage";
import EditEventPage from "./pages/EditEventPage";

// Empty placeholder component for pages that aren't implemented yet
const PlaceholderPage = ({ title }) => (
  <div style={{ textAlign: "center", padding: "2rem" }}>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

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
        path="/events"
        element={
          <Layout>
            <EventsPage />
          </Layout>
        }
      />
      <Route
        path="/events/edit/:id"
        element={
          <Layout>
            <EditEventPage />
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
      {/* Login route removed */}

      {/* Add a fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
