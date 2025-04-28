// src/pages/PickleballPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useEvents from "../hooks/useEvents";
import EditPickleballDialog from "../components/events/pickleball/EditPickleballDialog";
import PickleballSectionDialog from "../components/events/pickleball/PickleballSectionDialog";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import "./styles/PickleballPage.css";

const PickleballPage = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const { getEvent, updateEvent, loading, error } = useEvents();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [pickleballSections, setPickleballSections] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && hasRole) {
      setIsAdmin(hasRole("admin"));
    }
  }, [isAuthenticated, hasRole]);

  // Fetch the event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch the pickleball event data using slug
        const response = await getEvent("pickleball-tournament");
        if (response && response.data) {
          setEventData(response.data);

          // Initialize sections from event data or with empty array
          if (response.data.sections && Array.isArray(response.data.sections)) {
            setPickleballSections(response.data.sections);
          } else {
            setPickleballSections([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch pickleball event data:", err);
      }
    };

    fetchEventData();
  }, [getEvent]);

  const handleEditEvent = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEvent = async (data) => {
    // In a real implementation, you would save this to the server
    const updatedEventData = {
      ...eventData,
      ...data,
      pricePerTeam: data.pricePerTeam, // Add the new field
    };

    setEventData(updatedEventData);
    setIsEditDialogOpen(false);

    // Uncomment this to save changes to the server
    /*
    try {
      await updateEvent(eventData.titleSlug, updatedEventData);
    } catch (err) {
      console.error("Failed to save event changes:", err);
    }
    */
  };

  const handleAddSection = () => {
    setCurrentSection(null);
    setIsSectionDialogOpen(true);
  };

  const handleEditSection = (section) => {
    setCurrentSection(section);
    setIsSectionDialogOpen(true);
  };

  const handleSaveSection = async (sectionData) => {
    let updatedSections;

    if (!currentSection) {
      // Adding a new section
      updatedSections = [...pickleballSections, sectionData];
    } else {
      // Updating existing section
      updatedSections = pickleballSections.map((section) =>
        section.id === sectionData.id ? sectionData : section
      );
    }

    setPickleballSections(updatedSections);
    setIsSectionDialogOpen(false);

    // Update the server (in a real implementation)
    if (eventData) {
      try {
        const updatedEventData = {
          ...eventData,
          sections: updatedSections,
        };

        // Uncomment this to save changes to the server
        // await updateEvent(eventData.titleSlug, updatedEventData);

        setEventData(updatedEventData);
      } catch (err) {
        console.error("Failed to save section changes:", err);
      }
    }
  };

  const handleDeleteSection = async (sectionId) => {
    const updatedSections = pickleballSections.filter(
      (section) => section.id !== sectionId
    );

    setPickleballSections(updatedSections);
    setIsSectionDialogOpen(false);

    // Update the server (in a real implementation)
    if (eventData) {
      try {
        const updatedEventData = {
          ...eventData,
          sections: updatedSections,
        };

        // Uncomment this to save changes to the server
        // await updateEvent(eventData.titleSlug, updatedEventData);

        setEventData(updatedEventData);
      } catch (err) {
        console.error("Failed to delete section:", err);
      }
    }
  };

  // Helper function to format date and time
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "Date TBD";

    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    if (!timeStr) return formattedDate;

    const [hours, minutes] = timeStr.split(":");
    const time = new Date();
    time.setHours(parseInt(hours));
    time.setMinutes(parseInt(minutes));

    const formattedTime = time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">Loading tournament information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          Error loading tournament data: {error}
        </div>
        <Link to="/events" className="back-button">
          Back to Events
        </Link>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="error-container">
        <div className="error-message">
          Pickleball Tournament data not found. Please make sure you have
          created an event with the slug "pickleball-tournament".
        </div>
        <Link to="/events" className="back-button">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="pickleball-container">
      {/* Tournament Header */}
      <div className="pickleball-header">
        <div className="header-content">
          <h1>{eventData.title}</h1>

          <div className="pickleball-meta">
            <div className="meta-item">
              <span className="meta-label">Date:</span>
              <span>
                {new Date(eventData.startDate).toLocaleDateString()} -
                {new Date(eventData.endDate).toLocaleDateString()}
              </span>
            </div>

            <div className="meta-item">
              <span className="meta-label">Location:</span>
              <span>{eventData.location || "TBD"}</span>
            </div>

            <div className="meta-item">
              <span className="meta-label">Registration Fee:</span>
              <span>{eventData.pricePerTeam || "$25 per team"}</span>
            </div>
          </div>
        </div>

        {/* Admin edit button */}
        {isAdmin && (
          <div className="admin-actions">
            <button
              onClick={handleEditEvent}
              className="edit-tournament-button"
            >
              Edit Tournament
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="pickleball-content">
        {/* Main Description */}
        <div className="pickleball-description">
          <p>{eventData.description}</p>
        </div>

        {/* Tournament Sections */}
        <div className="pickleball-sections">
          <div className="sections-header">
            <h2>Divisions</h2>

            {isAdmin && (
              <button className="add-section-button" onClick={handleAddSection}>
                Add Division
              </button>
            )}
          </div>

          {pickleballSections.length === 0 ? (
            <div className="no-sections-message">
              {isAdmin
                ? "No divisions have been added yet. Click 'Add Division' to create tournament divisions."
                : "Tournament divisions will be announced soon."}
            </div>
          ) : (
            <div className="sections-list">
              {pickleballSections.map((section) => (
                <div className="section-card" key={section.id}>
                  <div className="section-header">
                    <h3>{section.title}</h3>

                    {isAdmin && (
                      <button
                        className="edit-section-button"
                        onClick={() => handleEditSection(section)}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="section-details">
                    <div className="section-info">
                      <div className="info-item">
                        <span className="info-label">Tournament Date:</span>
                        <span>
                          {formatDateTime(
                            section.tournamentDate,
                            section.tournamentTime
                          )}
                        </span>
                      </div>

                      {section.registrationOpenDate && (
                        <div className="info-item">
                          <span className="info-label">
                            Registration Opens:
                          </span>
                          <span>
                            {new Date(
                              section.registrationOpenDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="info-item">
                        <span className="info-label">Teams:</span>
                        <span>0 / {section.maxTeams || "Unlimited"}</span>
                      </div>
                    </div>

                    <div className="section-action">
                      <Link
                        to="/register/pickleball"
                        className="register-button"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Image */}
        <div className="pickleball-image">
          <h2>Event Gallery</h2>
          <div className="image-container">
            <img
              src={
                eventData.imageGallery && eventData.imageGallery.length > 0
                  ? getImageUrl(eventData.imageGallery[0].imageUrl)
                  : "/images/placeholder-event.jpg"
              }
              alt={eventData.title}
              onError={handleImageError}
            />
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="back-navigation">
        <Link to="/events" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to Events
        </Link>
      </div>

      {/* Dialogs */}
      {isEditDialogOpen && (
        <EditPickleballDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          eventData={eventData}
          onSave={handleSaveEvent}
        />
      )}

      {isSectionDialogOpen && (
        <PickleballSectionDialog
          isOpen={isSectionDialogOpen}
          onClose={() => setIsSectionDialogOpen(false)}
          section={currentSection}
          onSave={handleSaveSection}
          onDelete={handleDeleteSection}
        />
      )}
    </div>
  );
};

export default PickleballPage;
