// src/hooks/useSponsors.js
import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const useSponsors = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/sponsors/tiers`, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sponsor tiers");
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const createTier = useCallback(async (data) => {
    const response = await axios.post(`${API_BASE_URL}/sponsors/tiers`, data, {
      withCredentials: true,
    });
    return response.data;
  }, []);

  const updateTier = useCallback(async (tierId, data) => {
    const response = await axios.put(
      `${API_BASE_URL}/sponsors/tiers/${tierId}`,
      data,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const deleteTier = useCallback(async (tierId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/sponsors/tiers/${tierId}`,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const reorderTiers = useCallback(async (tiers) => {
    const response = await axios.put(
      `${API_BASE_URL}/sponsors/tiers/reorder`,
      { tiers },
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const addSponsor = useCallback(async (tierId, data) => {
    const response = await axios.post(
      `${API_BASE_URL}/sponsors/tiers/${tierId}/entries`,
      data,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const updateSponsor = useCallback(async (sponsorId, data) => {
    const response = await axios.put(
      `${API_BASE_URL}/sponsors/entries/${sponsorId}`,
      data,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const deleteSponsor = useCallback(async (sponsorId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/sponsors/entries/${sponsorId}`,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const uploadSponsorLogo = useCallback(async (sponsorId, formData) => {
    const response = await axios.post(
      `${API_BASE_URL}/sponsors/entries/${sponsorId}/logo`,
      formData,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  return {
    loading,
    error,
    getTiers,
    createTier,
    updateTier,
    deleteTier,
    reorderTiers,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    uploadSponsorLogo,
  };
};

export default useSponsors;
