// src/hooks/useAPI.jsx
import { useState, useCallback } from "react";
import axios from "axios";

// API base URL - hardcoded for development
const API_BASE_URL = "http://localhost:3000";

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configure axios with default base URL
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  // Mock implementation for getPublishedEvents
  const getPublishedEvents = useCallback(() => {
    // Return mock data instead of making API call
    const mockEvents = [
      {
        id: "1",
        title: "Summer Festival",
        description:
          "Annual summer celebration with music, food, and activities.",
        location: "City Park",
        registrationId: "summer-fest",
        segments: [
          {
            id: "101",
            title: "Family Day",
            date: "2025-07-15",
            time: "10:00",
          },
          {
            id: "102",
            title: "Concert Night",
            date: "2025-07-16",
            time: "18:00",
          },
        ],
      },
      {
        id: "2",
        title: "Golf Tournament",
        description: "Annual charity golf tournament",
        location: "Green Valley Golf Course",
        registrationId: "golf",
        segments: [
          {
            id: "201",
            title: "Adult Division",
            date: "2025-08-20",
            time: "08:00",
          },
          {
            id: "202",
            title: "Senior Division",
            date: "2025-08-21",
            time: "09:00",
          },
        ],
      },
    ];

    return Promise.resolve({ events: mockEvents });
  }, []);

  return {
    loading,
    error,
    getPublishedEvents,
    // Other methods will be mock implementations
    getEventByRegistrationId: () => Promise.resolve({ event: {} }),
    updateEvent: () => Promise.resolve({}),
    deleteEventSegment: () => Promise.resolve({}),
    getRegistrations: () => Promise.resolve({ registrants: [] }),
    createRegistration: () => Promise.resolve({}),
    updateRegistration: () => Promise.resolve({}),
    deleteRegistration: () => Promise.resolve({}),
    getEventImages: () => Promise.resolve([]),
    uploadEventImage: () => Promise.resolve({ image: {} }),
    deleteEventImage: () => Promise.resolve({}),
    reorderEventImages: () => Promise.resolve([]),
  };
};
