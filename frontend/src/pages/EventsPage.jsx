// src/pages/EventsPage.jsx
import { useState } from "react";
import "./EventsPage.css";

function EventsPage() {
  // Mock events data
  const events = [
    {
      id: 1,
      title: "Summer Festival",
      date: "July 15-17, 2025",
      description:
        "Annual summer celebration with music, food, and family activities.",
      image: "/api/placeholder/300/200",
    },
    {
      id: 2,
      title: "Golf Tournament",
      date: "August 5, 2025",
      description: "Community golf tournament at South Weber Golf Course.",
      image: "/api/placeholder/300/200",
    },
    {
      id: 3,
      title: "Pickleball Championship",
      date: "August 12-13, 2025",
      description: "Regional pickleball competition for all skill levels.",
      image: "/api/placeholder/300/200",
    },
    {
      id: 4,
      title: "Harvest Fair",
      date: "September 25, 2025",
      description:
        "Celebration of local agriculture with produce contests and farm exhibits.",
      image: "/api/placeholder/300/200",
    },
  ];

  return (
    <div className="events-container">
      <h1>Upcoming Events</h1>

      <div className="events-list">
        {events.map((event) => (
          <div className="event-card" key={event.id}>
            <div className="event-image">
              <img src={event.image} alt={event.title} />
            </div>
            <div className="event-details">
              <h2>{event.title}</h2>
              <p className="event-date">{event.date}</p>
              <p className="event-description">{event.description}</p>
              <button className="event-button">Learn More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventsPage;
