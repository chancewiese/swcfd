// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Dashboard = ({ auth }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [familyData, setFamilyData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch family data
        if (auth.user?.family) {
          try {
            const familyRes = await axios.get("/api/families/my-family", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            setFamilyData(familyRes.data.data);
          } catch (err) {
            console.error("Error fetching family data:", err);
          }
        }

        // Fetch upcoming events (you would implement this endpoint)
        try {
          const eventsRes = await axios.get(
            "/api/events?upcoming=true&limit=5",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUpcomingEvents(eventsRes.data.data || []);
        } catch (err) {
          console.error("Error fetching upcoming events:", err);
        }

        // Fetch user registrations (you would implement this endpoint)
        try {
          const registrationsRes = await axios.get("/api/registrations/user", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setUserRegistrations(registrationsRes.data.data || []);
        } catch (err) {
          console.error("Error fetching user registrations:", err);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [auth.user]);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>My Dashboard</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashboard-grid">
        {/* Welcome Card */}
        <div className="dashboard-card welcome-card">
          <h2>Welcome, {auth.user?.firstName}!</h2>
          <p>
            This is your personal dashboard where you can manage your profile,
            family, and event registrations.
          </p>
        </div>

        {/* Profile Card */}
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <h3>My Profile</h3>
            <Link to="/profile" className="card-action">
              Edit
            </Link>
          </div>
          <div className="card-content">
            <div className="profile-info">
              <div className="info-row">
                <strong>Name:</strong> {auth.user?.firstName}{" "}
                {auth.user?.lastName}
              </div>
              <div className="info-row">
                <strong>Email:</strong> {auth.user?.email}
              </div>
              <div className="info-row">
                <strong>Roles:</strong> {auth.user?.roles?.join(", ")}
              </div>
            </div>
          </div>
          <div className="card-footer">
            <Link to="/profile" className="btn btn-primary">
              View Full Profile
            </Link>
          </div>
        </div>

        {/* Family Card */}
        <div className="dashboard-card family-card">
          <div className="card-header">
            <h3>My Family</h3>
            <Link to="/family" className="card-action">
              Manage
            </Link>
          </div>
          <div className="card-content">
            {familyData ? (
              <div className="family-info">
                <div className="info-row">
                  <strong>Family Name:</strong> {familyData.name}
                </div>
                <div className="info-row">
                  <strong>Members:</strong> {familyData.members?.length || 0}
                </div>
                <div className="family-members-preview">
                  {familyData.members?.slice(0, 3).map((member) => (
                    <div key={member._id} className="member-preview">
                      {member.firstName} {member.lastName}
                    </div>
                  ))}
                  {familyData.members?.length > 3 && (
                    <div className="member-preview more-members">
                      +{familyData.members.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p>No family information available.</p>
            )}
          </div>
          <div className="card-footer">
            <Link to="/family" className="btn btn-primary">
              Manage Family
            </Link>
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="dashboard-card events-card">
          <div className="card-header">
            <h3>Upcoming Events</h3>
            <Link to="/events" className="card-action">
              View All
            </Link>
          </div>
          <div className="card-content">
            {upcomingEvents.length > 0 ? (
              <div className="events-list">
                {upcomingEvents.map((event) => (
                  <div key={event._id} className="event-item">
                    <div className="event-title">
                      <Link to={`/events/${event.titleSlug}`}>
                        {event.title}
                      </Link>
                    </div>
                    <div className="event-date">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No upcoming events found.</p>
            )}
          </div>
          <div className="card-footer">
            <Link to="/events" className="btn btn-primary">
              Browse All Events
            </Link>
          </div>
        </div>

        {/* My Registrations Card */}
        <div className="dashboard-card registrations-card">
          <div className="card-header">
            <h3>My Registrations</h3>
            <Link to="/my-registrations" className="card-action">
              View All
            </Link>
          </div>
          <div className="card-content">
            {userRegistrations.length > 0 ? (
              <div className="registrations-list">
                {userRegistrations.map((registration) => (
                  <div key={registration._id} className="registration-item">
                    <div className="registration-title">
                      {registration.event?.title}
                    </div>
                    <div className="registration-status">
                      Status:{" "}
                      <span className={`status-${registration.status}`}>
                        {registration.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No registrations found.</p>
            )}
          </div>
          <div className="card-footer">
            <Link to="/my-registrations" className="btn btn-primary">
              View All Registrations
            </Link>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="actions-grid">
              <Link to="/events" className="action-item">
                <div className="action-icon">📅</div>
                <div className="action-title">Browse Events</div>
              </Link>
              <Link to="/family" className="action-item">
                <div className="action-icon">👪</div>
                <div className="action-title">Manage Family</div>
              </Link>
              <Link to="/profile" className="action-item">
                <div className="action-icon">👤</div>
                <div className="action-title">Edit Profile</div>
              </Link>
              <Link to="/my-registrations" className="action-item">
                <div className="action-icon">🎟️</div>
                <div className="action-title">My Registrations</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
