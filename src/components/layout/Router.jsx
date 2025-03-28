// src/components/layout/Router.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Import pages
import HomePage from "../../pages/HomePage";
import AboutPage from "../../pages/AboutPage";
import EventsPage from "../../pages/EventsPage";
import GalleryPage from "../../pages/GalleryPage";
import SponsorsPage from "../../pages/SponsorsPage";
import ContactPage from "../../pages/ContactPage";
import LoginPage from "../../pages/LoginPage";
import CalendarPage from "../../pages/CalendarPage";

// Import event pages
import GolfPage from "../../pages/events/GolfPage";
import PickleballPage from "../../pages/events/PickleballPage";

// Protected Route component
const ProtectedRoute = ({ children, requiredAuth }) => {
  const { user } = useAuth();

  if (requiredAuth && !user) {
    return <Navigate to="/login" />;
  }

  if (requiredAuth === "admin" && (!user || !user.isAdmin)) {
    return <Navigate to="/" />;
  }

  return children;
};

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/golf" element={<GolfPage />} />
      <Route path="/events/pickleball" element={<PickleballPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/sponsors" element={<SponsorsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Add a fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
