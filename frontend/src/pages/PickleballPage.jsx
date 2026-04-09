// src/pages/PickleballPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDevMode } from "../context/DevModeContext";
import useEvents from "../hooks/useEvents";
import EditPickleballDialog from "../components/events/pickleball/EditPickleballDialog";
import PickleballSectionDialog from "../components/events/pickleball/PickleballSectionDialog";
import GalleryEditDialog from "../components/events/pickleball/GalleryEditDialog";
import SectionRegistrationsDialog from "../components/events/pickleball/SectionRegistrationsDialog";
import useRegistration from "../hooks/useRegistration";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import "./styles/PickleballPage.css";

const PickleballPage = () => {
  const { hasRole } = useAuth();
  const { devMode } = useDevMode();
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
  const [isRegistrationsDialogOpen, setIsRegistrationsDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const { getSectionRegistrationCount } = useRegistration();
  const isAdmin = hasRole("admin") && devMode;
  const [eventData, setEventData] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the event data
  const fetchEventData = async () => {
    try {
      const response = await getEvent("pickleball-tournament");
      if (response && response.data) {
        setEventData(response.data);
        // Fetch registration counts for each section
        if (response.data.sections?.length) {
          const counts = {};
          await Promise.all(
            response.data.sections.map(async (section) => {
              try {
                const res = await getSectionRegistrationCount(section._id);
                counts[section._id] = res?.data?.count ?? 0;
              } catch {
                counts[section._id] = 0;
              }
            })
          );
          setRegistrationCounts(counts);
        }
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

  // Format dates display - Updated for single date range
  const formatDatesDisplay = (eventDates, startDate, endDate) => {
    // Use startDate and endDate directly (no more eventDates array)
    if (!startDate || !endDate) return "Dates TBD";

    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    };

    // Same day
    if (start.toISOString().split("T")[0] === end.toISOString().split("T")[0]) {
      return formatDate(start);
    }

    // Date range
    return `${formatDate(start)} - ${formatDate(end)}`;
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
              {eventData.sections
                .filter((section) => isAdmin || section.isPublished !== false)
                .map((section, index) => (
                <div className="section-card" key={section._id || index}>
                  <div className="section-header">
                    <div className="section-title-row">
                      <h3>{section.title}</h3>
                      {isAdmin && section.isPublished === false && (
                        <span className="unpublished-badge">Unpublished</span>
                      )}
                    </div>

                    {isAdmin && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="edit-section-button"
                          onClick={() => {
                            setCurrentSection(section);
                            setIsRegistrationsDialogOpen(true);
                          }}
                          type="button"
                          style={{ borderColor: "#2e7d32", color: "#2e7d32" }}
                        >
                          Registrations
                        </button>
                        <button
                          className="edit-section-button"
                          onClick={() => handleEditSection(section, index)}
                          type="button"
                        >
                          Edit
                        </button>
                      </div>
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
                          {registrationCounts[section._id] ?? 0} /{" "}
                          {section.capacity || section.maxTeams || "Unlimited"}
                        </span>
                      </div>

                      {(section.price || eventData.pricePerTeam) && (
                        <div className="info-item">
                          <span className="info-label">Price:</span>
                          <span>
                            {section.price
                              ? `$${section.price}`
                              : eventData.pricePerTeam}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="section-action">
                      <Link
                        to={`/register/pickleball?section=${section._id}`}
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

      {isRegistrationsDialogOpen && (
        <SectionRegistrationsDialog
          isOpen={isRegistrationsDialogOpen}
          onClose={() => setIsRegistrationsDialogOpen(false)}
          section={currentSection}
        />
      )}
    </div>
  );
};

export default PickleballPage;
