// src/hooks/useAPI.js
import { useState, useCallback } from "react";
import axios from "axios";

// Create axios instance with defaults
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  timeout: 10000,
});

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic request function
  const request = useCallback(
    async (method, url, data = null, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api({
          method,
          url,
          data: method !== "get" ? data : null,
          params: method === "get" ? data : null,
          ...options,
        });

        setLoading(false);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Convenience methods
  const get = useCallback(
    (url, params, options) => request("get", url, params, options),
    [request]
  );

  const post = useCallback(
    (url, data, options) => request("post", url, data, options),
    [request]
  );

  const put = useCallback(
    (url, data, options) => request("put", url, data, options),
    [request]
  );

  const del = useCallback(
    (url, options) => request("delete", url, null, options),
    [request]
  );

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

  const deleteEvent = useCallback((id) => del(`/events/${id}`), [del]);

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
    get,
    post,
    put,
    delete: del,
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    addEventSection,
    updateEventSection,
    deleteEventSection,
  };
};

export default useAPI;
