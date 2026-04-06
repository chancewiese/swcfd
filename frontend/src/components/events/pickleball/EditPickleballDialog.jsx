// src/components/events/pickleball/EditPickleballDialog.jsx
import { useState, useEffect } from "react";
import "../../../pages/styles/PickleballPage.css";
import "./PickleballDialog.css";

const EditPickleballDialog = ({
  isOpen,
  onClose,
  eventData,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    pricePerTeam: "",
    startDate: "",
    endDate: "",
    isPublished: false,
  });

  const [error, setError] = useState("");

  // Initialize form data when eventData changes
  useEffect(() => {
    if (eventData) {
      // Parse pricePerTeam - extract just the number, no default
      let priceValue = "";
      if (eventData.pricePerTeam) {
        const priceMatch = eventData.pricePerTeam.match(/\$?(\d+(?:\.\d{2})?)/);
        priceValue = priceMatch ? priceMatch[1] : "";
      }

      // Format dates for input fields (YYYY-MM-DD)
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        location: eventData.location || "",
        pricePerTeam: priceValue,
        startDate: formatDateForInput(eventData.startDate),
        endDate: formatDateForInput(eventData.endDate),
        isPublished: eventData.isPublished || false,
      });
    }
  }, [eventData]);

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, isSaving, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For price, strip out any non-numeric characters except decimal
    if (name === "pricePerTeam") {
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.title.trim()) {
      setError("Tournament title is required");
      return;
    }

    // Validate dates
    if (!formData.startDate) {
      setError("Start date is required");
      return;
    }

    if (!formData.endDate) {
      setError("End date is required");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("End date must be after start date");
      return;
    }

    // Validate price format if provided
    if (formData.pricePerTeam && isNaN(parseFloat(formData.pricePerTeam))) {
      setError("Price must be a valid number");
      return;
    }

    // Format data for saving
    const formattedData = {
      ...formData,
      pricePerTeam: formData.pricePerTeam
        ? `$${parseFloat(formData.pricePerTeam)} per team`
        : "$25 per team",
    };

    onSave(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay" onClick={onClose}>
      <div
        className="pickleball-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Edit Tournament</h2>

        {error && <div className="dialog-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Tournament Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={isSaving}
              placeholder="e.g., Annual Pickleball Tournament"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              disabled={isSaving}
              placeholder="Describe the tournament..."
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={isSaving}
              placeholder="e.g., City Park Pickleball Courts"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pricePerTeam">Price Per Team ($)</label>
            <input
              type="number"
              id="pricePerTeam"
              name="pricePerTeam"
              value={formData.pricePerTeam}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              disabled={isSaving}
              placeholder="25"
            />
          </div>

          <div className="form-group">
            <label>Tournament Date Range</label>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                className="checkbox-input"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                disabled={isSaving}
              />
              <span className="checkbox-text">Published</span>
            </label>
            <small className="help-text">
              {formData.isPublished
                ? "Tournament is visible to the public"
                : "Tournament is only visible to administrators"}
            </small>
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPickleballDialog;
