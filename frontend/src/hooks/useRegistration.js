// src/hooks/useRegistration.js
import { useCallback } from "react";
import { useApiCore } from "./api/useApiCore";

const useRegistration = () => {
  const { loading, error, get, post, put, delete: del } = useApiCore();

  // Create a new registration
  const createRegistration = useCallback(
    (registrationData) => post("/registrations", registrationData),
    [post]
  );

  // Get current user's registrations
  const getMyRegistrations = useCallback(
    () => get("/registrations/my"),
    [get]
  );

  // Get a single registration by ID
  const getRegistration = useCallback(
    (id) => get(`/registrations/${id}`),
    [get]
  );

  // Get registration count for a section (public)
  const getSectionRegistrationCount = useCallback(
    (sectionId) => get(`/registrations/section/${sectionId}/count`),
    [get]
  );

  // Get all registrations for a section (admin)
  const getRegistrationsBySection = useCallback(
    (sectionId) => get(`/registrations/section/${sectionId}`),
    [get]
  );

  // Get all registrations for an event (admin)
  const getAllRegistrations = useCallback(
    (eventSlug) =>
      get("/registrations", eventSlug ? { eventSlug } : undefined),
    [get]
  );

  // Update a registration
  const updateRegistration = useCallback(
    (id, data) => put(`/registrations/${id}`, data),
    [put]
  );

  // Cancel a registration
  const cancelRegistration = useCallback(
    (id) => del(`/registrations/${id}`),
    [del]
  );

  return {
    loading,
    error,
    createRegistration,
    getMyRegistrations,
    getRegistration,
    getSectionRegistrationCount,
    getRegistrationsBySection,
    getAllRegistrations,
    updateRegistration,
    cancelRegistration,
  };
};

export default useRegistration;
