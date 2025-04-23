// src/hooks/useFamily.js
import { useState, useCallback } from "react";
import api from "../utils/axiosConfig"; // Import the configured axios instance

/**
 * Custom hook for managing family data
 *
 * @returns {Object} Family management methods and state
 */
const useFamily = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get the current user's family
   *
   * @returns {Promise} Promise resolving to family data
   */
  const getMyFamily = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/families/my-family");
      setLoading(false);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get family data");
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Update the current user's family information
   *
   * @param {Object} familyData - Updated family data
   * @returns {Promise} Promise resolving to updated family data
   */
  const updateFamily = useCallback(async (familyData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put("/families/my-family", familyData);
      setLoading(false);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update family");
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Add a new family member
   *
   * @param {Object} memberData - Family member data
   * @returns {Promise} Promise resolving to the new family member
   */
  const addFamilyMember = useCallback(async (memberData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        "/families/my-family/members",
        memberData
      );
      setLoading(false);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add family member");
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Update an existing family member
   *
   * @param {string} memberId - ID of the family member to update
   * @param {Object} memberData - Updated family member data
   * @returns {Promise} Promise resolving to the updated family member
   */
  const updateFamilyMember = useCallback(async (memberId, memberData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(
        `/families/my-family/members/${memberId}`,
        memberData
      );
      setLoading(false);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update family member");
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Delete a family member
   *
   * @param {string} memberId - ID of the family member to delete
   * @returns {Promise} Promise resolving to success status
   */
  const deleteFamilyMember = useCallback(async (memberId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/families/my-family/members/${memberId}`);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete family member");
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Invite a user to join the family
   *
   * @param {string} email - Email of the user to invite
   * @returns {Promise} Promise resolving to success status and invitation URL (if in development)
   */
  const inviteToFamily = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/families/invite", { email });
      setLoading(false);
      return {
        success: true,
        inviteUrl: response.data.inviteUrl, // Only available in development
      };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation");
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Join a family using an invitation token
   *
   * @param {string} inviteToken - Invitation token
   * @returns {Promise} Promise resolving to success status and family data
   */
  const joinFamily = useCallback(async (inviteToken) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/families/join/${inviteToken}`);
      setLoading(false);
      return {
        success: true,
        family: response.data.data.family,
      };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join family");
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Transfer family ownership to another user
   *
   * @param {string} userId - ID of the user to transfer ownership to
   * @returns {Promise} Promise resolving to success status
   */
  const transferOwnership = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/families/transfer-ownership/${userId}`);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to transfer ownership");
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    getMyFamily,
    updateFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    inviteToFamily,
    joinFamily,
    transferOwnership,
  };
};

export default useFamily;
