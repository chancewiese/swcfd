// src/pages/SponsorsPage.jsx
import { useState, useEffect } from "react";
import "./SponsorsPage.css";

const SponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);

  // Placeholder sponsors
  useEffect(() => {
    const placeholderSponsors = [
      {
        id: 1,
        name: "Smith's Family Market",
        level: "Platinum",
        description:
          "Local grocery store supporting our community for over 30 years.",
        logo: "/api/placeholder/200/100",
      },
      {
        id: 2,
        name: "Weber Credit Union",
        level: "Gold",
        description: "Supporting financial growth in our community since 1985.",
        logo: "/api/placeholder/200/100",
      },
      {
        id: 3,
        name: "Mountain View Medical Center",
        level: "Gold",
        description: "Providing quality healthcare services to our community.",
        logo: "/api/placeholder/200/100",
      },
      {
        id: 4,
        name: "Johnson Construction",
        level: "Silver",
        description:
          "Building homes and businesses in South Weber for 20 years.",
        logo: "/api/placeholder/200/100",
      },
      {
        id: 5,
        name: "Green Valley Landscaping",
        level: "Silver",
        description: "Making South Weber beautiful one yard at a time.",
        logo: "/api/placeholder/200/100",
      },
      {
        id: 6,
        name: "Weber Family Restaurant",
        level: "Bronze",
        description: "Serving delicious meals with a family atmosphere.",
        logo: "/api/placeholder/200/100",
      },
    ];

    setSponsors(placeholderSponsors);
  }, []);

  // No loading or error states needed without API

  // Group sponsors by level
  const sponsorsByLevel = sponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.level]) {
      acc[sponsor.level] = [];
    }
    acc[sponsor.level].push(sponsor);
    return acc;
  }, {});

  const levels = ["Platinum", "Gold", "Silver", "Bronze"];

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Our Sponsors</h1>

      <div className="paper p-3 mb-4">
        <p>
          Country Fair Days wouldn't be possible without the generous support of
          our community sponsors. We thank each of these organizations for their
          contributions to making our annual celebration a success!
        </p>

        <p>
          Interested in becoming a sponsor? <a href="/contact">Contact us</a>{" "}
          for sponsorship opportunities.
        </p>
      </div>

      {levels.map((level) => {
        if (!sponsorsByLevel[level]) return null;

        return (
          <div key={level} className="mb-5">
            <h2 className="mb-3">{level} Sponsors</h2>

            <div className="grid">
              {sponsorsByLevel[level].map((sponsor) => (
                <div key={sponsor.id} className="col-12 col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="mb-3 text-center">
                        <img
                          src={sponsor.logo}
                          alt={`${sponsor.name} logo`}
                          className="sponsor-logo"
                        />
                      </div>
                      <h3 className="card-title">{sponsor.name}</h3>
                      <p className="card-text">{sponsor.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SponsorsPage;
