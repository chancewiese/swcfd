// src/pages/EventPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import useAPI from "../hooks/useAPI";
import "./styles/EventPage.css";

function EventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const { getEvent, loading, error } = useAPI();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEvent(slug);
        setEvent(response.data);
      } catch (err) {
        console.error("Failed to fetch event:", err);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug, getEvent]);

  // Format date for display
  const formatEventDate = (startDate, endDate) => {
    if (!startDate || !endDate) return "";

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

  // Format registration date
  const formatRegistrationDate = (date) => {
    if (!date) return "Registration date not set";
    return format(new Date(date), "MMMM d, yyyy");
  };

  if (loading) {
    return <div className="loading-message">Loading event details...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading event: {error}</div>;
  }

  if (!event) {
    return <div className="error-message">Event not found</div>;
  }

  return (
    <div className="event-detail-container">
      <Link to="/events" className="back-button">
        ← Back to Events
      </Link>

      <div className="event-header">
        <h1>{event.title}</h1>
        <div className="event-meta">
          <div className="event-meta-item">
            <span>📅</span>
            <span>{formatEventDate(event.startDate, event.endDate)}</span>
          </div>
          <div className="event-meta-item">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {event.imageGallery && event.imageGallery.length > 0 && (
        <div className="event-gallery">
          <img
            src={event.imageGallery[0].imageUrl}
            alt={event.imageGallery[0].name}
            className="main-image"
          />
        </div>
      )}

      <div className="event-description">
        <p>{event.description}</p>
      </div>

      {event.sections && event.sections.length > 0 && (
        <div className="event-sections">
          <h2>Event Sections</h2>
          {event.sections.map((section) => (
            <div className="event-section" key={section._id}>
              <h3>{section.title}</h3>
              <div className="section-description">
                <p>{section.description}</p>
              </div>
              <div className="section-details">
                {section.capacity && (
                  <div className="section-detail">
                    <h4>Capacity</h4>
                    <p>{section.capacity} participants</p>
                  </div>
                )}
                {section.registrationOpenDate && (
                  <div className="section-detail">
                    <h4>Registration Opens</h4>
                    <p className="registration-date">
                      {formatRegistrationDate(section.registrationOpenDate)}
                    </p>
                  </div>
                )}
              </div>
              <button className="register-button">Register</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventPage;
