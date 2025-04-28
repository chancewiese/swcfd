// src/components/events/pickleball/EditPickleballDialog.jsx
import { useState, useEffect } from "react";
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
    isPublished: true,
  });

  const [error, setError] = useState("");

  // Initialize form when event data changes
  useEffect(() => {
    if (eventData) {
      // Fix date formatting issues by adjusting for timezone
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        location: eventData.location || "",
        pricePerTeam: eventData.pricePerTeam || "25",
        startDate: formatDate(eventData.startDate),
        endDate: formatDate(eventData.endDate),
        isPublished:
          eventData.isPublished !== undefined ? eventData.isPublished : true,
      });
    }
  }, [eventData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // For numeric inputs, ensure they're numbers
    if (name === "pricePerTeam") {
      // Remove non-numeric characters except decimal point
      const numericValue = value.replace(/[^\d.]/g, "");
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

  const togglePublished = () => {
    setFormData({
      ...formData,
      isPublished: !formData.isPublished,
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

    // Validate price format if provided
    if (formData.pricePerTeam && isNaN(parseFloat(formData.pricePerTeam))) {
      setError("Price must be a valid number");
      return;
    }

    // Format price as a currency for display
    const formattedData = {
      ...formData,
      pricePerTeam: formData.pricePerTeam
        ? `$${parseFloat(formData.pricePerTeam).toFixed(2)}`
        : "$25.00",
    };

    onSave(formattedData);
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
              disabled={isSaving}
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
              disabled={isSaving}
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
              disabled={isSaving}
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
              placeholder="25"
              min="0"
              step="0.01"
              disabled={isSaving}
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

          <div className="form-group publish-toggle">
            <label>Publication Status</label>
            <button
              type="button"
              className={`publish-toggle-button ${
                formData.isPublished ? "published" : "unpublished"
              }`}
              onClick={togglePublished}
              disabled={isSaving}
            >
              {formData.isPublished ? "Published" : "Unpublished"}
            </button>
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
