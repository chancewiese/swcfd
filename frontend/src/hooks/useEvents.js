// frontend/src/hooks/useEvents.js
import { useCallback } from "react";
import { useApiCore } from "./api/useApiCore";

const useEvents = () => {
  const { loading, error, get, post, put, delete: del } = useApiCore();

  // Event-specific methods
  const getEvents = useCallback(() => get("/events"), [get]);

  // Get event by slug
  const getEvent = useCallback((slug) => get(`/events/${slug}`), [get]);

  // Create event
  const createEvent = useCallback(
    (eventData) => post("/events", eventData),
    [post]
  );

  // Update event by slug
  const updateEvent = useCallback(
    (slug, eventData) => put(`/events/${slug}`, eventData),
    [put]
  );

  // Delete event by slug
  const deleteEvent = useCallback((slug) => del(`/events/${slug}`), [del]);

  // Image-specific methods
  const getEventImages = useCallback(
    (slug) => get(`/events/${slug}/images`),
    [get]
  );

  const uploadEventImage = useCallback(
    (slug, formData) => {
      // For file uploads, we don't need to manually set Content-Type
      // It will be set automatically with the proper boundary
      return post(`/events/${slug}/images/upload`, formData);
    },
    [post]
  );

  const deleteEventImage = useCallback(
    (slug, imageId) => del(`/events/${slug}/images/${imageId}`),
    [del]
  );

  // Section-specific methods
  const addEventSection = useCallback(
    (eventSlug, sectionData) =>
      post(`/events/${eventSlug}/sections`, sectionData),
    [post]
  );

  const updateEventSection = useCallback(
    (eventSlug, sectionId, sectionData) =>
      put(`/events/${eventSlug}/sections/${sectionId}`, sectionData),
    [put]
  );

  const deleteEventSection = useCallback(
    (eventSlug, sectionId) => del(`/events/${eventSlug}/sections/${sectionId}`),
    [del]
  );

  return {
    loading,
    error,
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventImages, // New method
    uploadEventImage, // New method
    deleteEventImage, // New method
    addEventSection,
    updateEventSection,
    deleteEventSection,
  };
};

export default useEvents;
