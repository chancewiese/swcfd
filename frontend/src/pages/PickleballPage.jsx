// src/pages/PickleballPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useEvents from "../hooks/useEvents";
import EditPickleballDialog from "../components/events/pickleball/EditPickleballDialog";
import PickleballSectionDialog from "../components/events/pickleball/PickleballSectionDialog";
import GalleryEditDialog from "../components/events/pickleball/GalleryEditDialog";
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
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
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
  const fetchEventData = async () => {
    try {
      const response = await getEvent("pickleball-tournament");
      if (response && response.data) {
        setEventData(response.data);
        console.log("Event data loaded:", response.data);
        console.log("Image gallery:", response.data.imageGallery);
      }
    } catch (err) {
      console.error("Failed to fetch pickleball event data:", err);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, []);

  const handleEditEvent = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEvent = async (data) => {
    setIsSaving(true);

    try {
      const updatedEventData = {
        ...eventData,
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        eventDates: data.eventDates,
        pricePerTeam: data.pricePerTeam,
        isPublished: data.isPublished,
      };

      await updateEvent(eventData.titleSlug, updatedEventData);

      const refreshedEvent = await getEvent(eventData.titleSlug);
      if (refreshedEvent && refreshedEvent.data) {
        setEventData(refreshedEvent.data);
      }

      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Failed to save event:", err);
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
      if (currentSection && currentSection._id) {
        await updateEventSection(
          eventData.titleSlug,
          currentSection._id,
          sectionData,
        );
      } else {
        await addEventSection(eventData.titleSlug, sectionData);
      }

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
    if (!sectionId) {
      setIsSectionDialogOpen(false);
      return;
    }

    setIsSaving(true);

    try {
      await deleteEventSection(eventData.titleSlug, sectionId);
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

  const handleGalleryUpdated = async () => {
    // Refresh event data to get updated gallery
    await fetchEventData();
  };

  const handlePrevImage = () => {
    setMainImageIndex((prev) =>
      prev === 0 ? eventData.imageGallery.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setMainImageIndex((prev) =>
      prev === eventData.imageGallery.length - 1 ? 0 : prev + 1,
    );
  };

  // Format dates display
  const formatDatesDisplay = (eventDates, startDate, endDate) => {
    // Use eventDates if available, otherwise fall back to legacy startDate/endDate
    let dates = [];

    if (eventDates && eventDates.length > 0) {
      dates = eventDates;
    } else if (startDate && endDate) {
      dates = [{ startDate, endDate }];
    }

    if (dates.length === 0) return "Dates TBD";

    // Sort dates chronologically
    const sortedDates = [...dates].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate),
    );

    // Format each date range
    const formattedRanges = sortedDates.map((dateRange) => {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);

      // Format dates
      const startDay = start.getUTCDate();
      const endDay = end.getUTCDate();
      const startMonth = start.toLocaleDateString("en-US", {
        month: "long",
        timeZone: "UTC",
      });
      const endMonth = end.toLocaleDateString("en-US", {
        month: "long",
        timeZone: "UTC",
      });
      const startYear = start.getUTCFullYear();
      const endYear = end.getUTCFullYear();

      // Get ordinal suffix
      const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      // Same day
      if (
        start.toISOString().split("T")[0] === end.toISOString().split("T")[0]
      ) {
        return `${startMonth} ${getOrdinal(startDay)}, ${startYear}`;
      }

      // Same month and year
      if (startMonth === endMonth && startYear === endYear) {
        return `${startMonth} ${getOrdinal(startDay)}-${getOrdinal(endDay)}, ${startYear}`;
      }

      // Same year, different months
      if (startYear === endYear) {
        return `${startMonth} ${getOrdinal(startDay)} - ${endMonth} ${getOrdinal(endDay)}, ${startYear}`;
      }

      // Different years
      return `${startMonth} ${getOrdinal(startDay)}, ${startYear} - ${endMonth} ${getOrdinal(endDay)}, ${endYear}`;
    });

    // Join multiple ranges with commas
    return formattedRanges.join(", ");
  };

  // Helper function to format date and time for sections
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "Date TBD";

    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
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
          Pickleball Tournament data not found.
        </div>
        <Link to="/events" className="back-button">
          Back to Events
        </Link>
      </div>
    );
  }

  const hasMultipleDates =
    (eventData.eventDates && eventData.eventDates.length > 1) ||
    (!eventData.eventDates && eventData.startDate !== eventData.endDate);

  const hasImages = eventData.imageGallery && eventData.imageGallery.length > 0;

  return (
    <div className="pickleball-container">
      {/* Tournament Header */}
      <div className="pickleball-header">
        <div className="header-content">
          <h1>{eventData.title}</h1>

          <div className="pickleball-meta">
            <div className="meta-item">
              <span className="meta-label">
                {hasMultipleDates ? "Dates:" : "Date:"}
              </span>
              <span>
                {formatDatesDisplay(
                  eventData.eventDates,
                  eventData.startDate,
                  eventData.endDate,
                )}
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

        {isAdmin && (
          <div className="admin-actions">
            <button
              onClick={handleEditEvent}
              className="edit-tournament-button"
              type="button"
            >
              Edit Tournament
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="pickleball-content">
        {/* Description */}
        <div className="pickleball-description">
          <p>{eventData.description}</p>
        </div>

        {/* Tournament Sections/Divisions */}
        <div className="pickleball-sections">
          <div className="sections-header">
            <h2>Divisions</h2>

            {isAdmin && (
              <button
                className="add-section-button"
                onClick={handleAddSection}
                type="button"
              >
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
                        type="button"
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
                            section.tournamentTime,
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

        {/* Image Gallery Hero Slider - MOVED BELOW DIVISIONS */}
        {hasImages && (
          <div className="pickleball-gallery">
            <h2>Event Gallery</h2>
            <div className="gallery-hero-container">
              <div className="hero-image-wrapper">
                <img
                  src={getImageUrl(
                    eventData.imageGallery[mainImageIndex].imageUrl,
                  )}
                  alt={
                    eventData.imageGallery[mainImageIndex].name ||
                    `Event image ${mainImageIndex + 1}`
                  }
                  className="hero-gallery-image"
                  onError={handleImageError}
                />
              </div>

              {eventData.imageGallery.length > 1 && (
                <>
                  <button
                    className="gallery-nav-button prev"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    type="button"
                  >
                    ‹
                  </button>
                  <button
                    className="gallery-nav-button next"
                    onClick={handleNextImage}
                    aria-label="Next image"
                    type="button"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {eventData.imageGallery.length > 1 && (
              <div className="gallery-indicators">
                {eventData.imageGallery.map((_, index) => (
                  <button
                    key={index}
                    className={`gallery-indicator ${
                      index === mainImageIndex ? "active" : ""
                    }`}
                    onClick={() => setMainImageIndex(index)}
                    aria-label={`Go to image ${index + 1}`}
                    type="button"
                  />
                ))}
              </div>
            )}

            {isAdmin && (
              <button
                className="edit-gallery-button"
                onClick={() => setIsGalleryDialogOpen(true)}
                type="button"
              >
                Edit Gallery
              </button>
            )}
          </div>
        )}

        {/* Show Edit Gallery button even if no images yet (for admin) */}
        {isAdmin && !hasImages && (
          <div className="pickleball-gallery">
            <h2>Event Gallery</h2>
            <button
              className="edit-gallery-button"
              onClick={() => setIsGalleryDialogOpen(true)}
              type="button"
            >
              Add Images to Gallery
            </button>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="back-navigation">
        <Link to="/events" className="back-button">
          Back to Events
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

      {isGalleryDialogOpen && (
        <GalleryEditDialog
          isOpen={isGalleryDialogOpen}
          onClose={() => setIsGalleryDialogOpen(false)}
          eventSlug={eventData.titleSlug}
          images={eventData.imageGallery || []}
          onImagesUpdated={handleGalleryUpdated}
        />
      )}
    </div>
  );
};

export default PickleballPage;
