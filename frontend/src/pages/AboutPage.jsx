// src/pages/AboutPage.jsx
import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-container">
      <h1>About Country Fair Days</h1>

      <section className="about-section">
        <h2>Our Story</h2>
        <p>
          Country Fair Days began in 1985 as a small community gathering to
          celebrate our town's agricultural heritage. What started as a
          single-day event has grown into a beloved annual tradition spanning
          multiple days and featuring a variety of activities for all ages.
        </p>
      </section>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          We aim to bring our community together through memorable events that
          celebrate our shared history, showcase local talent, and create
          lasting connections between neighbors. Country Fair Days is committed
          to providing affordable, family-friendly entertainment that enriches
          our community.
        </p>
      </section>

      <section className="about-section">
        <h2>Community Impact</h2>
        <p>
          Each year, Country Fair Days supports local businesses, raises funds
          for community projects, and provides a platform for local artists and
          performers. We're proud to contribute to the economic and cultural
          vitality of our region.
        </p>
      </section>
    </div>
  );
}

export default AboutPage;
