// src/pages/EventsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
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

  // Format date for display
  const formatEventDate = (startDate, endDate) => {
    if (!startDate || !endDate) return "Date not set";

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      return format(start, "MMMM d, yyyy");
    }

    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      return `${format(start, "MMMM d")}-${format(end, "d, yyyy")}`;
    }

    return `${format(start, "MMMM d, yyyy")} - ${format(end, "MMMM d, yyyy")}`;
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
