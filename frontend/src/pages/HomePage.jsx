// src/pages/HomePage.jsx
import "./HomePage.css";

function HomePage() {
  return (
    <div className="home-container">
      <header>
        <h1>Country Fair Days</h1>
        <p>Community Events and Recreation</p>
      </header>

      <main>
        <section className="welcome-section">
          <h2>Welcome to Country Fair Days</h2>
          <p>Join us for fun community events throughout the year.</p>
          <button className="primary-button">View Events</button>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Country Fair Days</p>
      </footer>
    </div>
  );
}

export default HomePage;
