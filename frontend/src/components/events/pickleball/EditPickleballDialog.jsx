// src/components/events/pickleball/EditPickleballDialog.jsx
import { useState, useEffect } from "react";
import "./PickleballDialog.css";

const EditPickleballDialog = ({ isOpen, onClose, eventData, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    pricePerTeam: "$25",
    startDate: "",
    endDate: "",
    isPublished: true,
    // Image gallery will be handled separately
  });

  const [error, setError] = useState("");

  // Initialize form when event data changes
  useEffect(() => {
    if (eventData) {
      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        location: eventData.location || "",
        pricePerTeam: eventData.pricePerTeam || "$25",
        startDate: eventData.startDate
          ? new Date(eventData.startDate).toISOString().split("T")[0]
          : "",
        endDate: eventData.endDate
          ? new Date(eventData.endDate).toISOString().split("T")[0]
          : "",
        isPublished:
          eventData.isPublished !== undefined ? eventData.isPublished : true,
      });
    }
  }, [eventData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.title.trim()) {
      setError("Tournament title is required");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Tournament start and end dates are required");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay">
      <div className="pickleball-dialog-content">
        <h2>Edit Pickleball Tournament</h2>

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
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              placeholder="Enter tournament description"
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
              placeholder="e.g., Community Recreation Center"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pricePerTeam">Price Per Team</label>
            <input
              type="text"
              id="pricePerTeam"
              name="pricePerTeam"
              value={formData.pricePerTeam}
              onChange={handleInputChange}
              placeholder="e.g., $25"
            />
          </div>

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
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
              />
              Publish Tournament
            </label>
          </div>

          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPickleballDialog;
