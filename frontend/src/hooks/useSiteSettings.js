// src/hooks/useSiteSettings.js
import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const useSiteSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getHeroImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/site/hero-images`, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load hero images");
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadHeroImage = useCallback(async (formData) => {
    const response = await axios.post(
      `${API_BASE_URL}/site/hero-images/upload`,
      formData,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const deleteHeroImage = useCallback(async (imageId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/site/hero-images/${imageId}`,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const getAbout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/site/about`, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load about content");
      return { success: false, data: { content: "" } };
    } finally {
      setLoading(false);
    }
  }, []);

  const getContact = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/site/contact`, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contact info");
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAbout = useCallback(async (content) => {
    const response = await axios.put(
      `${API_BASE_URL}/site/about`,
      { content },
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const addOrganizer = useCallback(async (organizerData) => {
    const response = await axios.post(
      `${API_BASE_URL}/site/organizers`,
      organizerData,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const updateOrganizer = useCallback(async (organizerId, organizerData) => {
    const response = await axios.put(
      `${API_BASE_URL}/site/organizers/${organizerId}`,
      organizerData,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const deleteOrganizer = useCallback(async (organizerId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/site/organizers/${organizerId}`,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const getGalleryPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/site/gallery`, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load gallery");
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadGalleryPhoto = useCallback(async (formData) => {
    const response = await axios.post(
      `${API_BASE_URL}/site/gallery/upload`,
      formData,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  const deleteGalleryPhoto = useCallback(async (photoId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/site/gallery/${photoId}`,
      { withCredentials: true },
    );
    return response.data;
  }, []);

  return {
    loading,
    error,
    getHeroImages,
    uploadHeroImage,
    deleteHeroImage,
    getAbout,
    getContact,
    updateAbout,
    addOrganizer,
    updateOrganizer,
    deleteOrganizer,
    getGalleryPhotos,
    uploadGalleryPhoto,
    deleteGalleryPhoto,
  };
};

export default useSiteSettings;
