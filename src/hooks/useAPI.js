// src/hooks/useAPI.jsx
import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// API base URL - adjust for your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const useAPI = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configure axios with auth token if available
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  if (user) {
    api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
  }

  // Handle API errors
  const handleError = (error) => {
    console.error("API Error:", error);
    setError(
      error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred"
    );
    return null;
  };

  // Get all published events
  const getPublishedEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/events/published");
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  // Get a specific event by registration ID
  const getEventByRegistrationId = useCallback(async (registrationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/events/${registrationId}`);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  // Update an event
  const updateEvent = useCallback(async (eventId, eventData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  // Delete an event segment
  const deleteEventSegment = useCallback(async (eventId, segmentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(
        `/events/${eventId}/segments/${segmentId}`
      );
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  // Get registrations for an event
  const getRegistrations = useCallback(async (registrationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/registrations/${registrationId}`);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  // Create a registration
  const createRegistration = useCallback(
    async (registrationId, registrationData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post(
          `/registrations/${registrationId}`,
          registrationData
        );
        setLoading(false);
        return response.data;
      } catch (error) {
        setLoading(false);
        return handleError(error);
      }
    },
    []
  );

  // Update a registration
  const updateRegistration = useCallback(
    async (registrationId, id, updatedData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.put(
          `/registrations/${registrationId}/${id}`,
          updatedData
        );
        setLoading(false);
        return response.data;
      } catch (error) {
        setLoading(false);
        return handleError(error);
      }
    },
    []
  );

  // Delete a registration
  const deleteRegistration = useCallback(async (registrationId, id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(
        `/registrations/${registrationId}/${id}`
      );
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  // Event image handling (placeholder implementations)
  const getEventImages = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/events/${eventId}/images`);
      setLoading(false);
      return response.data.images || [];
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  const uploadEventImage = useCallback(async (eventId, formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/events/${eventId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  const deleteEventImage = useCallback(async (eventId, imageId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/events/${eventId}/images/${imageId}`);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  const reorderEventImages = useCallback(async (eventId, imageIds) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/events/${eventId}/images/reorder`, {
        imageIds,
      });
      setLoading(false);
      return response.data.images || [];
    } catch (error) {
      setLoading(false);
      return handleError(error);
    }
  }, []);

  return {
    loading,
    error,
    getPublishedEvents,
    getEventByRegistrationId,
    updateEvent,
    deleteEventSegment,
    getRegistrations,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    getEventImages,
    uploadEventImage,
    deleteEventImage,
    reorderEventImages,
  };
};
