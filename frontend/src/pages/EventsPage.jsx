// src/pages/EventsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import useEvents from "../hooks/useEvents";
import AddEventDialog from "../components/AddEventDialog";
import "./styles/EventsPage.css";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const { getEvents, loading, error } = useEvents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Separate published and unpublished events
  const publishedEvents = events.filter((event) => event.isPublished);
  const unpublishedEvents = events.filter((event) => !event.isPublished);

  // Event card component for DRY code
  const EventCard = ({ event }) => (
    <div
      className={`event-card ${!event.isPublished ? "unpublished-event" : ""}`}
      key={event.titleSlug}
    >
      <div className="event-image">
        <img
          src={
            event.imageGallery && event.imageGallery.length > 0
              ? event.imageGallery[0].imageUrl
              : "/api/placeholder/300/200"
          }
          alt={
            event.imageGallery && event.imageGallery.length > 0
              ? event.imageGallery[0].name
              : event.title
          }
        />
      </div>
      <div className="event-details">
        <h2>{event.title}</h2>
        <p className="event-date">
          {formatEventDate(event.startDate, event.endDate)}
        </p>
        <p className="event-location">{event.location}</p>
        <p className="event-description">{event.description}</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to={`/events/${event.titleSlug}`}>
            <button className="event-button">View Event</button>
          </Link>
          <Link to={`/events/edit/${event.titleSlug}`}>
            <button
              className="event-button"
              style={{ backgroundColor: "#4caf50" }}
            >
              Edit
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="events-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Events</h1>
        <button
          className="event-button"
          style={{ marginBottom: 0 }}
          onClick={() => setIsDialogOpen(true)}
        >
          Add New Event
        </button>
      </div>

      {loading && <p className="loading-message">Loading events...</p>}
      {error && <p className="error-message">Error loading events: {error}</p>}

      {!loading && !error && events.length === 0 && (
        <p className="no-events-message">No events found.</p>
      )}

      {/* Published Events Section */}
      <div className="event-section">
        <h2>Published Events</h2>
        {publishedEvents.length === 0 ? (
          <p className="no-events-message">No published events at this time.</p>
        ) : (
          <div className="events-list">
            {publishedEvents.map((event) => (
              <EventCard event={event} key={event.titleSlug} />
            ))}
          </div>
        )}
      </div>

      {/* Unpublished Events Section */}
      <div className="event-section">
        <h2>Unpublished Events</h2>
        {unpublishedEvents.length === 0 ? (
          <p className="no-events-message">
            No unpublished events at this time.
          </p>
        ) : (
          <div className="events-list">
            {unpublishedEvents.map((event) => (
              <EventCard event={event} key={event.titleSlug} />
            ))}
          </div>
        )}
      </div>

      <AddEventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}

export default EventsPage;
