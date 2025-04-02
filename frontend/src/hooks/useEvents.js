// frontend/src/hooks/useEvents.js
import { useCallback } from "react";
import { useApiCore } from "./api/useApiCore";

const useEvents = () => {
  const { loading, error, get, post, put, delete: del } = useApiCore();

  // Event-specific methods
  const getEvents = useCallback(() => get("/events"), [get]);
  const getEvent = useCallback((idOrSlug) => get(`/events/${idOrSlug}`), [get]);
  const createEvent = useCallback(
    (eventData) => post("/events", eventData),
    [post]
  );
  const updateEvent = useCallback(
    (id, eventData) => put(`/events/${id}`, eventData),
    [put]
  );

  const updateEventBySlug = useCallback(
    (slug, eventData) => put(`/events/bySlug/${slug}`, eventData),
    [put]
  );

  const deleteEvent = useCallback((id) => del(`/events/${id}`), [del]);

  // Section-specific methods
  const addEventSection = useCallback(
    (eventId, sectionData) => post(`/events/${eventId}/sections`, sectionData),
    [post]
  );
  const updateEventSection = useCallback(
    (eventId, sectionId, sectionData) =>
      put(`/events/${eventId}/sections/${sectionId}`, sectionData),
    [put]
  );
  const deleteEventSection = useCallback(
    (eventId, sectionId) => del(`/events/${eventId}/sections/${sectionId}`),
    [del]
  );

  return {
    loading,
    error,
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    updateEventBySlug,
    deleteEvent,
    addEventSection,
    updateEventSection,
    deleteEventSection,
  };
};

export default useEvents;
