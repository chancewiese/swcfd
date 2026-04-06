// src/components/events/pickleball/PickleballSectionDialog.jsx
import { useState, useEffect } from "react";
import "./PickleballDialog.css";

const PickleballSectionDialog = ({
  isOpen,
  onClose,
  section,
  onSave,
  onDelete,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    description: "",
    maxTeams: "",
    price: "",
    registrationOpenDate: "",
    tournamentDate: "",
    tournamentTime: "",
    isPublished: true,
  });

  const [error, setError] = useState("");

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

  // Initialize form data when section changes
  useEffect(() => {
    if (section) {
      // Format dates for input fields and handle timezone offset
      const formatDate = (dateString) => {
        if (!dateString) return "";

        // Create a date object and adjust for timezone offset
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        _id: section._id || "",
        title: section.title || "",
        description: section.description || "",
        maxTeams: section.capacity || section.maxTeams || "",
        price: section.price || "",
        registrationOpenDate: formatDate(section.registrationOpenDate),
        tournamentDate: formatDate(section.tournamentDate),
        tournamentTime: section.tournamentTime || "",
        isPublished: section.isPublished !== undefined ? section.isPublished : true,
      });
    } else {
      // New section defaults
      setFormData({
        _id: "",
        title: "",
        description: "",
        maxTeams: "",
        price: "",
        registrationOpenDate: "",
        tournamentDate: "",
        tournamentTime: "",
        isPublished: true,
      });
    }
  }, [section, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // Handle checkbox
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: e.target.checked });
      return;
    }

    // For numeric inputs, ensure they're numbers
    if (name === "maxTeams" || name === "price") {
      // Remove non-numeric characters except decimal point for price
      const numericValue =
        name === "price"
          ? value.replace(/[^\d.]/g, "")
          : value.replace(/[^\d]/g, "");

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

    // Validation
    if (!formData.title.trim()) {
      setError("Division title is required");
      return;
    }

    // Format the data - FIXED: Include tournamentDate in the payload
    const sectionData = {
      title: formData.title,
      description: formData.description,
      capacity: formData.maxTeams ? parseInt(formData.maxTeams) : null,
      maxTeams: formData.maxTeams ? parseInt(formData.maxTeams) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      registrationOpenDate: formData.registrationOpenDate || null,
      tournamentDate: formData.tournamentDate || null,
      tournamentTime: formData.tournamentTime || null,
      isPublished: formData.isPublished,
    };

    // Include _id if editing existing section
    if (formData._id) {
      sectionData._id = formData._id;
    }

    console.log("Submitting section data:", sectionData); // Debug log

    onSave(sectionData);
  };

  const handleDelete = () => {
    if (
      formData._id &&
      window.confirm("Are you sure you want to delete this division?")
    ) {
      onDelete(formData._id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay" onClick={onClose}>
      <div
        className="pickleball-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{section ? "Edit Division" : "Add Division"}</h2>

        {error && <div className="dialog-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Division Name</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={isSaving}
              placeholder="e.g., Men's Doubles, Women's Doubles"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              disabled={isSaving}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxTeams">Maximum Teams (Capacity)</label>
              <input
                type="number"
                id="maxTeams"
                name="maxTeams"
                value={formData.maxTeams}
                onChange={handleInputChange}
                placeholder="e.g., 24"
                min="1"
                disabled={isSaving}
              />
              <small className="help-text">
                Leave empty for unlimited capacity
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price Per Team ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 25"
                min="0"
                step="0.01"
                disabled={isSaving}
              />
              <small className="help-text">
                Leave empty to use event default
              </small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="registrationOpenDate">Registration Opens</label>
            <input
              type="date"
              id="registrationOpenDate"
              name="registrationOpenDate"
              value={formData.registrationOpenDate}
              onChange={handleInputChange}
              disabled={isSaving}
            />
            <small className="help-text">
              When registration becomes available
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tournamentDate">Tournament Date</label>
              <input
                type="date"
                id="tournamentDate"
                name="tournamentDate"
                value={formData.tournamentDate}
                onChange={handleInputChange}
                disabled={isSaving}
              />
              <small className="help-text">Date of this division</small>
            </div>

            <div className="form-group">
              <label htmlFor="tournamentTime">Tournament Time</label>
              <input
                type="time"
                id="tournamentTime"
                name="tournamentTime"
                value={formData.tournamentTime}
                onChange={handleInputChange}
                disabled={isSaving}
              />
              <small className="help-text">Start time (optional)</small>
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                className="checkbox-input"
                checked={formData.isPublished}
                onChange={handleInputChange}
                disabled={isSaving}
              />
              <span className="checkbox-text">Published</span>
            </label>
            <small className="help-text">
              {formData.isPublished
                ? "Division is visible to the public"
                : "Division is only visible to administrators"}
            </small>
          </div>

          <div className="dialog-actions">
            {formData._id && (
              <button
                type="button"
                className="delete-btn"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Delete Division
              </button>
            )}
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Division"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PickleballSectionDialog;
