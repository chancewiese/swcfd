// src/pages/SponsorsPage.jsx
const SponsorsPage = () => {
  const sponsors = [
    {
      name: "Local Business 1",
      level: "Gold",
      description: "Community supporter",
    },
    {
      name: "Local Business 2",
      level: "Silver",
      description: "Event sponsor",
    },
    {
      name: "Local Business 3",
      level: "Bronze",
      description: "Activity sponsor",
    },
  ];

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Our Sponsors</h1>

      <div className="grid">
        {sponsors.map((sponsor, index) => (
          <div className="col-12 col-md-4" key={index}>
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">{sponsor.name}</h2>
                <p className="card-subtitle">{sponsor.level}</p>
                <p className="card-text">{sponsor.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsorsPage;
