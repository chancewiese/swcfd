// src/pages/events/GolfPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAPI } from "../../hooks/useAPI";
import EventManagementDialog from "../../components/events/EventManagementDialog";
import RegistrationDialog from "../../components/events/RegistrationDialog";
import RegistrationsTable from "../../components/events/RegistrationsTable";
import EventGallery from "../../components/events/EventGallery";
import { format, parseISO } from "date-fns";

const GolfPage = () => {
  const { user } = useAuth();
  const {
    getEventByRegistrationId,
    updateEvent,
    deleteEventSegment,
    getRegistrations,
    createRegistration,
    deleteRegistration,
    updateRegistration,
    getEventImages,
    uploadEventImage,
    deleteEventImage,
    reorderEventImages,
  } = useAPI();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);

  useEffect(() => {
    fetchEventData();
    fetchRegistrations();
  }, []);

  useEffect(() => {
    if (event?.id) {
      fetchImages();
    }
  }, [event?.id]);

  const fetchEventData = async () => {
    try {
      const response = await getEventByRegistrationId("golf");
      setEvent(response.event);
    } catch (error) {
      console.error("Failed to fetch event data:", error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await getRegistrations("golf");
      setRegistrations(response.registrants || []);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    }
  };

  const fetchImages = async () => {
    try {
      const eventImages = await getEventImages(event.id);
      setImages(eventImages || []);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  };

  const handleEventUpdate = async (updatedEvent) => {
    try {
      await updateEvent(event.id, updatedEvent);
      setEvent(updatedEvent);
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleSegmentDelete = async (segmentId) => {
    try {
      await deleteEventSegment(event.id, segmentId);
      setEvent((prev) => ({
        ...prev,
        segments: prev.segments.filter((s) => s.id !== segmentId),
      }));
    } catch (error) {
      console.error("Failed to delete segment:", error);
    }
  };

  const handleClearRegistrants = async (segmentId) => {
    try {
      const segmentRegistrations = registrations.filter(
        (reg) => reg.segmentId === segmentId
      );

      for (const registration of segmentRegistrations) {
        await deleteRegistration("golf", registration.id);
      }

      fetchRegistrations();
    } catch (error) {
      console.error("Failed to clear registrants:", error);
    }
  };

  const handleRegistrationSubmit = async (registrationData) => {
    try {
      await createRegistration("golf", registrationData);
      fetchRegistrations();
    } catch (error) {
      console.error("Failed to submit registration:", error);
    }
  };

  const handleRegistrationUpdate = async (id, updatedData) => {
    try {
      await updateRegistration("golf", id, updatedData);
      fetchRegistrations();
    } catch (error) {
      console.error("Failed to update registration:", error);
    }
  };

  const handleRegistrationDelete = async (registrationId) => {
    try {
      await deleteRegistration("golf", registrationId);
      setRegistrations((prev) =>
        prev.filter((registration) => registration.id !== registrationId)
      );
    } catch (error) {
      console.error("Failed to delete registration:", error);
    }
  };

  const handleImageUpload = async (formData) => {
    try {
      const response = await uploadEventImage(event.id, formData);
      setImages((prev) => [...prev, response.image]);
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw error;
    }
  };

  const handleImageDelete = async (imageId) => {
    try {
      await deleteEventImage(event.id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const handleReorderImages = async (imageIds) => {
    try {
      const updatedImages = await reorderEventImages(event.id, imageIds);
      setImages(updatedImages);
    } catch (error) {
      console.error("Failed to reorder images:", error);
    }
  };

  if (!event) return <p>Loading...</p>;

  const sortedSegments = [...event.segments].sort((a, b) => {
    const dateA = parseISO(`${a.date}T${a.time}`);
    const dateB = parseISO(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="mb-5">
        <Link to="/events" className="btn btn-outlined-primary mb-2">
          ← Back to Events
        </Link>
        <div className="flex justify-between items-center mb-2">
          <h1>{event.title}</h1>
          <div className="flex gap-2">
            {user?.isAdmin && (
              <button
                className="btn btn-primary btn-icon"
                onClick={() => setManagementDialogOpen(true)}
              >
                <span className="icon-edit">✏️</span>
                Manage Event
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => setRegistrationDialogOpen(true)}
            >
              Register Now
            </button>
          </div>
        </div>
      </div>

      <div className="grid">
        {/* Event Information */}
        <div className="col-12">
          <div className="paper mb-4">
            <h2 className="mb-3">Event Details</h2>
            <p className="mb-3">{event.description}</p>
            <p className="mb-3">Location: {event.location}</p>

            <h3 className="mt-4 mb-3">Divisions</h3>
            <div className="grid">
              {sortedSegments.map((segment) => (
                <div className="col-12 col-sm-6 col-lg-4" key={segment.id}>
                  <div className="event-segment-card">
                    <div className="event-segment-content">
                      <h4 className="event-segment-title">{segment.title}</h4>
                      <p className="event-segment-datetime">
                        {format(parseISO(segment.date), "MMMM d, yyyy")} at{" "}
                        {format(
                          parseISO(`2024-01-01T${segment.time}`),
                          "h:mm a"
                        )}
                      </p>
                      <p className="event-segment-capacity">
                        Registered Teams:{" "}
                        {
                          registrations.filter(
                            (r) => r.segmentId === segment.id
                          ).length
                        }{" "}
                        {segment.maxTeams ? `/ ${segment.maxTeams}` : ""}
                      </p>
                    </div>
                    <div className="event-segment-action">
                      <button
                        className="btn btn-outlined-primary btn-full"
                        onClick={() => {
                          setSelectedSegment(segment);
                          setRegistrationDialogOpen(true);
                        }}
                        disabled={
                          segment.maxTeams &&
                          registrations.filter(
                            (r) => r.segmentId === segment.id
                          ).length >= segment.maxTeams
                        }
                      >
                        {segment.maxTeams &&
                        registrations.filter((r) => r.segmentId === segment.id)
                          .length >= segment.maxTeams
                          ? "Division Full"
                          : "Register for this Division"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Photo Gallery Section */}
        <div className="col-12">
          <div className="paper">
            <h2 className="mb-3">Photo Gallery</h2>
            <EventGallery
              eventId={event.id}
              images={images}
              onUpload={handleImageUpload}
              onDelete={handleImageDelete}
              onReorder={handleReorderImages}
            />
          </div>
        </div>

        {/* Admin Section */}
        {user?.isAdmin && (
          <div className="col-12">
            <div className="paper mt-4">
              <h2 className="mb-3">Registered Teams</h2>
              <RegistrationsTable
                registrations={registrations}
                segments={event.segments}
                onUpdate={handleRegistrationUpdate}
                onDelete={handleRegistrationDelete}
              />

              {/* Registration Counts */}
              <div className="mt-4">
                <h3 className="mb-3">Registration Summary</h3>
                {event.segments.map((segment) => {
                  const count = registrations.filter(
                    (r) => r.segmentId === segment.id
                  ).length;
                  return (
                    <p key={segment.id}>
                      {segment.title}: {count}{" "}
                      {segment.maxTeams ? `/ ${segment.maxTeams}` : ""}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <RegistrationDialog
        open={registrationDialogOpen}
        onClose={() => {
          setRegistrationDialogOpen(false);
          setSelectedSegment(null);
        }}
        onSubmit={handleRegistrationSubmit}
        segments={event.segments}
        initialData={{
          players: ["", ""],
          email: "",
          phone: "",
          segmentId: selectedSegment?.id || "",
        }}
      />

      {event && (
        <EventManagementDialog
          open={managementDialogOpen}
          onClose={() => setManagementDialogOpen(false)}
          event={event}
          onSave={handleEventUpdate}
          onDeleteSegment={handleSegmentDelete}
          onClearRegistrants={handleClearRegistrants}
        />
      )}
    </div>
  );
};

export default GolfPage;
