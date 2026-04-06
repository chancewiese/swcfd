// src/pages/EventsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useEvents from "../hooks/useEvents";
import { useAuth } from "../context/AuthContext";
import {
  getImageUrl,
  handleImageError,
  getEventPrimaryImage,
} from "../utils/imageUtils";
import "./styles/EventsPage.css";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const { getEvents, loading, error } = useEvents();
  const { isAuthenticated, hasRole } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (isAuthenticated && hasRole) {
      setIsAdmin(hasRole("admin"));
    }
  }, [isAuthenticated, hasRole]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        setEvents(response.data || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, [getEvents]);

  // Format date for display - FIXED to use UTC to avoid timezone issues
  const formatEventDate = (startDate, endDate) => {
    if (!startDate || !endDate) return "Date not set";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Helper to format date in UTC
    const formatUTCDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    };

    // Check if same day using UTC
    if (start.toISOString().split("T")[0] === end.toISOString().split("T")[0]) {
      return formatUTCDate(start);
    }

    // Check if same month and year using UTC
    const startMonth = start.getUTCMonth();
    const startYear = start.getUTCFullYear();
    const endMonth = end.getUTCMonth();
    const endYear = end.getUTCFullYear();

    if (startMonth === endMonth && startYear === endYear) {
      const startDay = start.getUTCDate();
      const endDay = end.getUTCDate();
      const monthName = start.toLocaleDateString("en-US", {
        month: "long",
        timeZone: "UTC",
      });
      return `${monthName} ${startDay}-${endDay}, ${startYear}`;
    }

    return `${formatUTCDate(start)} - ${formatUTCDate(end)}`;
  };

  // Filter events - if user is admin, show all; otherwise, show only published
  const filteredEvents = isAdmin
    ? events
    : events.filter((event) => event.isPublished);

  return (
    <div className="events-container">
      <h1>Events</h1>

      {loading && <div className="loading-message">Loading events...</div>}

      {error && <div className="error-message">{error}</div>}

      <div className="events-list">
        {filteredEvents.map((event) => (
          <div className="event-card" key={event._id || event.titleSlug}>
            {isAdmin && !event.isPublished && (
              <div className="unpublished-badge">Unpublished</div>
            )}
            <div className="event-image">
              <img
                src={getEventPrimaryImage(event)}
                alt={
                  event.imageGallery && event.imageGallery.length > 0
                    ? event.imageGallery[0].name
                    : event.title
                }
                onError={handleImageError}
              />
            </div>
            <div className="event-details">
              <h2>{event.title}</h2>
              <div className="event-date">
                {formatEventDate(event.startDate, event.endDate)}
              </div>
              {event.location && (
                <div className="event-location">{event.location}</div>
              )}
              <div className="event-description">
                {event.description && event.description.length > 150
                  ? `${event.description.substring(0, 150)}...`
                  : event.description}
              </div>

              <div className="event-button-container">
                {/* For Pickleball, use dedicated page; for others, use dynamic route */}
                {event.titleSlug === "pickleball-tournament" ? (
                  <Link to="/events/pickleball" className="event-button">
                    View Details
                  </Link>
                ) : (
                  <Link
                    to={`/events/${event.titleSlug}`}
                    className="event-button"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && !loading && (
        <div className="no-events-message">No events found.</div>
      )}
    </div>
  );
}

export default EventsPage;
