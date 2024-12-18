// Updated Router.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import EventsPage from "../../pages/EventsPage";
import CalendarPage from "../../pages/CalendarPage";
import AboutPage from "../../pages/AboutPage";
import GalleryPage from "../../pages/GalleryPage";
import SponsorsPage from "../../pages/SponsorsPage";
import ContactPage from "../../pages/ContactPage";
import LoginPage from "../../pages/LoginPage";
import PickleballPage from "../../pages/events/PickleballPage";
import GolfPage from "../../pages/events/GolfPage";

const Router = () => {
   return (
      <Routes>
         <Route path="/" element={<HomePage />} />
         <Route path="/events" element={<EventsPage />} />
         <Route path="/calendar" element={<CalendarPage />} />
         <Route path="/about" element={<AboutPage />} />
         <Route path="/gallery" element={<GalleryPage />} />
         <Route path="/sponsors" element={<SponsorsPage />} />
         <Route path="/contact" element={<ContactPage />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/events/pickleball" element={<PickleballPage />} />
         <Route path="/events/golf" element={<GolfPage />} />
         <Route path="*" element={<Navigate to="/" />} />
      </Routes>
   );
};

export default Router;
