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
  const {
    getEvent,
    updateEvent,
    addEventSection,
    updateEventSection,
    deleteEventSection,
    loading,
    error,
  } = useEvents();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);

    try {
      // Format the data properly for the API
      const updatedEventData = {
        ...eventData,
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        isPublished: data.isPublished,
        pricePerTeam: data.pricePerTeam, // Custom field for pickleball
      };

      // Save to the database through the API
      const response = await updateEvent(eventData.titleSlug, updatedEventData);

      if (response && response.data) {
        setEventData(response.data);
      }

      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Failed to save event changes:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = () => {
    setCurrentSection(null);
    setCurrentSectionIndex(-1);
    setIsSectionDialogOpen(true);
  };

  const handleEditSection = (section, index) => {
    setCurrentSection(section);
    setCurrentSectionIndex(index);
    setIsSectionDialogOpen(true);
  };

  const handleSaveSection = async (sectionData) => {
    setIsSaving(true);

    try {
      // Format the section data properly for the API
      const formattedSection = {
        title: sectionData.title,
        description: sectionData.description || "",
        capacity: sectionData.maxTeams ? parseInt(sectionData.maxTeams) : null,
        registrationOpenDate: sectionData.registrationOpenDate,
        tournamentDate: sectionData.tournamentDate, // Custom field
        tournamentTime: sectionData.tournamentTime, // Custom field
        price: sectionData.price ? parseFloat(sectionData.price) : null, // Add price field
      };

      let response;

      if (currentSectionIndex === -1) {
        // Add new section
        response = await addEventSection(eventData.titleSlug, formattedSection);
      } else {
        // Update existing section
        const sectionId = eventData.sections[currentSectionIndex]._id;
        response = await updateEventSection(
          eventData.titleSlug,
          sectionId,
          formattedSection
        );
      }

      // Refetch the event data to get updated sections
      const updatedEvent = await getEvent(eventData.titleSlug);
      if (updatedEvent && updatedEvent.data) {
        setEventData(updatedEvent.data);
      }

      setIsSectionDialogOpen(false);
    } catch (err) {
      console.error("Failed to save section:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section?")) {
      return;
    }

    setIsSaving(true);

    try {
      // Delete the section through the API
      await deleteEventSection(eventData.titleSlug, sectionId);

      // Refetch the event data to get updated sections
      const updatedEvent = await getEvent(eventData.titleSlug);
      if (updatedEvent && updatedEvent.data) {
        setEventData(updatedEvent.data);
      }

      setIsSectionDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete section:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image gallery navigation
  const handleThumbnailClick = (index) => {
    setMainImageIndex(index);
  };

  // Helper function to format date and time
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "Date TBD";

    // Fix the date issue by handling timezone offset
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);

    const formattedDate = correctedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
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
                {eventData.startDate && eventData.endDate
                  ? `${formatDateTime(eventData.startDate, null)
                      .split(", ")
                      .slice(0, -1)
                      .join(", ")} - 
                   ${formatDateTime(eventData.endDate, null)}`
                  : "Dates TBD"}
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

            {!eventData.isPublished && (
              <div className="meta-item">
                <span className="status-badge unpublished">Unpublished</span>
              </div>
            )}
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

          {!eventData.sections || eventData.sections.length === 0 ? (
            <div className="no-sections-message">
              {isAdmin
                ? "No divisions have been added yet. Click 'Add Division' to create tournament divisions."
                : "Tournament divisions will be announced soon."}
            </div>
          ) : (
            <div className="sections-list">
              {eventData.sections.map((section, index) => (
                <div className="section-card" key={section._id || index}>
                  <div className="section-header">
                    <h3>{section.title}</h3>

                    {isAdmin && (
                      <button
                        className="edit-section-button"
                        onClick={() => handleEditSection(section, index)}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="section-details">
                    <div className="section-info">
                      <div className="info-item">
                        <span className="info-label">Description:</span>
                        <span>
                          {section.description || "No description provided"}
                        </span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Tournament Date:</span>
                        <span>
                          {formatDateTime(
                            section.tournamentDate || section.startDate,
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
                            {formatDateTime(section.registrationOpenDate, null)}
                          </span>
                        </div>
                      )}

                      <div className="info-item">
                        <span className="info-label">Teams:</span>
                        <span>
                          0 /{" "}
                          {section.capacity || section.maxTeams || "Unlimited"}
                        </span>
                      </div>

                      {section.price && (
                        <div className="info-item">
                          <span className="info-label">Price:</span>
                          <span>${section.price}</span>
                        </div>
                      )}
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

        {/* Image Gallery */}
        {eventData.imageGallery && eventData.imageGallery.length > 0 && (
          <div className="pickleball-gallery">
            <h2>Event Gallery</h2>
            <div className="gallery-container">
              <div className="main-image-container">
                <img
                  src={getImageUrl(
                    eventData.imageGallery[mainImageIndex].imageUrl
                  )}
                  alt={eventData.imageGallery[mainImageIndex].name}
                  className="main-gallery-image"
                  onError={handleImageError}
                />
              </div>

              {eventData.imageGallery.length > 1 && (
                <div className="image-thumbnails">
                  {eventData.imageGallery.map((image, index) => (
                    <div
                      key={image._id || index}
                      className={`thumbnail ${
                        index === mainImageIndex ? "active" : ""
                      }`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={getImageUrl(image.imageUrl)}
                        alt={image.name}
                        onError={handleImageError}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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
          isSaving={isSaving}
        />
      )}

      {isSectionDialogOpen && (
        <PickleballSectionDialog
          isOpen={isSectionDialogOpen}
          onClose={() => setIsSectionDialogOpen(false)}
          section={currentSection}
          onSave={handleSaveSection}
          onDelete={handleDeleteSection}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default PickleballPage;
