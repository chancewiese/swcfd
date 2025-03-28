// src/pages/EventsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import useAPI from "../hooks/useAPI";
import AddEventDialog from "../components/AddEventDialog";
import "./styles/EventsPage.css";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const { getEvents, loading, error } = useAPI();
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
        <h1>Upcoming Events</h1>
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
        <p className="no-events-message">No upcoming events at this time.</p>
      )}

      <div className="events-list">
        {events.map((event) => (
          <div className="event-card" key={event._id}>
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
                <Link to={`/events/edit/${event._id}`}>
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
        ))}
      </div>

      <AddEventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}

export default EventsPage;
