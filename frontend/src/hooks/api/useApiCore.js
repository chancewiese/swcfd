// frontend/src/hooks/api/useApiCore.js
import { useState, useCallback } from "react";
import axios from "axios";

// Create axios instance with defaults
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  timeout: 10000,
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

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
};
