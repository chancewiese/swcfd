// src/pages/HomePage.jsx
import { Link } from "react-router-dom";

const HomePage = () => {
  const upcomingEvents = [
    {
      title: "Community BBQ",
      date: "July 4th, 2024",
      description: "Annual community gathering",
    },
    {
      title: "Summer Festival",
      date: "August 15th, 2024",
      description: "Music and food celebration",
    },
    {
      title: "Fall Fair",
      date: "September 20th, 2024",
      description: "Family-friendly activities",
    },
  ];

  const features = [
    {
      title: "Community Events",
      description: "Join us for local gatherings and celebrations",
    },
    {
      title: "Recreation",
      description: "Explore outdoor activities and facilities",
    },
    {
      title: "Local News",
      description: "Stay updated with community announcements",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to South Weber</h1>
          <p className="hero-subtitle">
            Your Gateway to Community Events and Recreation
          </p>
          <div className="hero-action">
            <Link to="/events" className="btn btn-primary btn-lg">
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="grid">
            {features.map((feature, index) => (
              <div className="col-12 col-md-4" key={index}>
                <div className="card">
                  <div className="card-body">
                    <h2 className="card-title">{feature.title}</h2>
                    <p className="card-text text-secondary">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="grid">
            {upcomingEvents.map((event, index) => (
              <div className="col-12 col-md-4" key={index}>
                <div className="card">
                  <div className="card-body">
                    <h3 className="card-title">{event.title}</h3>
                    <p className="card-subtitle">{event.date}</p>
                    <p className="card-text">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section">
        <div className="container">
          <div className="paper text-center">
            <h2>Get Involved</h2>
            <p>
              Join our community and stay updated with local events and
              activities.
            </p>
            <Link to="/contact" className="btn btn-primary mt-2">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
