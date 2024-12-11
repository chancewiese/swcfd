// src/hooks/useAPI.js
import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export const useAPI = () => {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const request = useCallback(
      async ({
         endpoint,
         method = "GET",
         data = null,
         params = null,
         headers = {},
      }) => {
         setLoading(true);
         setError(null);

         try {
            const response = await axios({
               url: `${API_BASE_URL}${endpoint}`,
               method,
               data,
               params,
               headers: {
                  "Content-Type": "application/json",
                  ...headers,
               },
            });

            return response.data;
         } catch (err) {
            console.error("Request error:", {
               endpoint,
               method,
               error: err.response?.data || err.message,
               status: err.response?.status,
            });
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
         } finally {
            setLoading(false);
         }
      },
      []
   );

   // Event API calls
   const getPublishedEvents = useCallback(
      (params) => {
         return request({
            endpoint: "/events/all", // Changed to /all since we're not using published filter
            params,
         });
      },
      [request]
   );

   const getEventByRegistrationId = useCallback(
      (registrationId) => {
         return request({
            endpoint: `/events/registration/${registrationId}`,
         });
      },
      [request]
   );

   const updateEvent = useCallback(
      (eventId, eventData) => {
         return request({
            endpoint: `/events/${eventId}`,
            method: "PUT",
            data: { event: eventData },
         });
      },
      [request]
   );

   // Add new segment to event
   const addEventSegment = useCallback(
      (eventId, segmentData) => {
         return request({
            endpoint: `/events/${eventId}/segments`,
            method: "POST",
            data: { segment: segmentData },
         });
      },
      [request]
   );

   // Delete segment from event
   const deleteEventSegment = useCallback(async (eventId, segmentId) => {
      try {
         return await axios.delete(
            `${API_BASE_URL}/events/${eventId}/segments/${segmentId}`
         );
      } catch (error) {
         console.error("Error in deleteEventSegment:", error);
         throw error;
      }
   }, []);

   // Registration API calls
   const getRegistrations = useCallback(
      (registrationId) => {
         return request({
            endpoint: `/registrations/${registrationId}`,
         });
      },
      [request]
   );

   const createRegistration = useCallback(
      (registrationId, registrationData) => {
         return request({
            endpoint: `/registrations/${registrationId}`,
            method: "POST",
            data: { registration: registrationData },
         });
      },
      [request]
   );

   const updateRegistration = useCallback(
      async (registrationId, id, updatedData) => {
         return request({
            endpoint: `/registrations/${registrationId}/${id}`,
            method: "PUT",
            data: { registration: updatedData },
         });
      },
      [request]
   );

   const deleteRegistration = useCallback(async (registrationId, id) => {
      try {
         return await axios.delete(
            `${API_BASE_URL}/registrations/${registrationId}/${id}`
         );
      } catch (error) {
         console.error("Error in deleteRegistration:", error);
         throw error;
      }
   }, []);

   return {
      loading,
      error,
      getPublishedEvents,
      getEventByRegistrationId,
      updateEvent,
      addEventSegment,
      deleteEventSegment,
      getRegistrations,
      createRegistration,
      deleteRegistration,
      updateRegistration,
   };
};
