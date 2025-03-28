// src/pages/MyRegistrationsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { format } from "date-fns";
import axios from "axios";
import "./MyRegistrationsPage.css";

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/registrations/my-registrations`
        );

        if (response.data.success) {
          setRegistrations(response.data.registrations);
        }
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setError("Failed to load your registrations");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [API_URL]);

  // Mock data for development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const mockRegistrations = [
        {
          id: "1",
          eventName: "Summer Golf Tournament",
          eventSection: "Adult Division",
          date: new Date(2025, 6, 15), // July 15, 2025
          status: "confirmed",
          paymentStatus: "paid",
          amount: 45.0,
        },
        {
          id: "2",
          eventName: "Pickleball Championship",
          eventSection: "Open Singles",
          date: new Date(2025, 7, 22), // August 22, 2025
          status: "pending",
          paymentStatus: "unpaid",
          amount: 25.0,
        },
      ];

      setRegistrations(mockRegistrations);
      setLoading(false);
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="registrations-container">
        <h1>My Registrations</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : registrations.length === 0 ? (
          <div className="no-registrations-message">
            <p>You haven't registered for any events yet.</p>
            <Link to="/events" className="view-events-button">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="registrations-list">
            {registrations.map((registration) => (
              <div key={registration.id} className="registration-card">
                <div className="registration-header">
                  <h2>{registration.eventName}</h2>
                  <span className={`status-badge ${registration.status}`}>
                    {registration.status.charAt(0).toUpperCase() +
                      registration.status.slice(1)}
                  </span>
                </div>

                <div className="registration-details">
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span>{registration.eventSection}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span>{format(registration.date, "MMMM d, yyyy")}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Payment:</span>
                    <span
                      className={`payment-status ${registration.paymentStatus}`}
                    >
                      {registration.paymentStatus.charAt(0).toUpperCase() +
                        registration.paymentStatus.slice(1)}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span>${registration.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="registration-actions">
                  <Link
                    to={`/events/${registration.eventName
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="view-event-button"
                  >
                    View Event
                  </Link>

                  {registration.paymentStatus === "unpaid" && (
                    <button className="payment-button">Make Payment</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MyRegistrationsPage;
