// frontend/src/hooks/api/useApiCore.js
import { useState, useCallback } from "react";
import axios from "axios";

// For Vite, environment variables are accessed via import.meta.env
// Default to localhost if not defined
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // Increased timeout for file uploads
});

export const useApiCore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic request function
  const request = useCallback(
    async (method, url, data = null, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        // Check if data is FormData (for file uploads)
        const isFormData = data instanceof FormData;

        // Set up the request configuration
        const requestConfig = {
          method,
          url,
          ...options,
        };

        // Handle form data differently to ensure proper content-type is set
        if (method !== "get") {
          if (isFormData) {
            // For FormData, let the browser set the content type with boundary
            requestConfig.data = data;
            // Ensure content-type is not manually set for FormData
            if (
              requestConfig.headers &&
              requestConfig.headers["Content-Type"]
            ) {
              delete requestConfig.headers["Content-Type"];
            }
          } else {
            // For JSON data
            requestConfig.data = data;
          }
        } else {
          // For GET requests
          requestConfig.params = data;
        }

        console.log(`Making ${method.toUpperCase()} request to ${url}`, {
          isFormData,
          hasData: !!data,
        });

        const response = await api(requestConfig);

        setLoading(false);
        return response.data;
      } catch (err) {
        console.error("API Error:", err);
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

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
};
