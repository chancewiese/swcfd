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
            endpoint: "/events/published",
            params,
         });
      },
      [request]
   );

   const getAllEvents = useCallback(
      (params) => {
         return request({
            endpoint: "/events/all",
            params,
         });
      },
      [request]
   );

   const getEventByRegistrationId = useCallback(
      (registrationId) => {
         return request({
            endpoint: `/events/${registrationId}`,
         });
      },
      [request]
   );

   const createEvent = useCallback(
      (eventData) => {
         return request({
            endpoint: "/events",
            method: "POST",
            data: { event: eventData },
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

   const deleteEvent = useCallback(
      (eventId) => {
         return request({
            endpoint: `/events/${eventId}`,
            method: "DELETE",
         });
      },
      [request]
   );

   // Admin API calls
   const getAdminData = useCallback(() => {
      return request({
         endpoint: "/admin",
      });
   }, [request]);

   const updateAdmin = useCallback(
      (adminData) => {
         return request({
            endpoint: "/admin",
            method: "PUT",
            data: { admin: adminData },
         });
      },
      [request]
   );

   return {
      loading,
      error,
      request,
      // Events API
      getPublishedEvents,
      getAllEvents,
      getEventByRegistrationId,
      createEvent,
      updateEvent,
      deleteEvent,
      // Admin API
      getAdminData,
      updateAdmin,
   };
};
