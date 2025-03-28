// src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import "./styles/HomePage.css";

function HomePage() {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Country Fair Days</h1>
        <p>Community Events and Recreation</p>
      </div>

      <section className="welcome-section">
        <h2>Welcome to Country Fair Days</h2>
        <p>
          Join us for fun community events throughout the year. From festivals
          to sports tournaments, there's something for everyone.
        </p>
        <Link to="/events">
          <button className="primary-button">View Events</button>
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
