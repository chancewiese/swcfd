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
  });

  const [error, setError] = useState("");

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
      });
    }
  }, [section, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // For numeric inputs, ensure they're numbers
    if (name === "maxTeams" || name === "price") {
      // Remove non-numeric characters except decimal point for price
      const numericValue =
        name === "price"
          ? value.replace(/[^\d.]/g, "")
          : value.replace(/\D/g, "");

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
      setError("Division title is required");
      return;
    }

    // Make sure maxTeams is a number if provided
    if (formData.maxTeams && isNaN(parseInt(formData.maxTeams))) {
      setError("Maximum teams must be a number");
      return;
    }

    // Validate price if provided
    if (formData.price && isNaN(parseFloat(formData.price))) {
      setError("Price must be a valid number");
      return;
    }

    // Make sure the registration date is before or equal to tournament date
    if (formData.registrationOpenDate && formData.tournamentDate) {
      const regDate = new Date(formData.registrationOpenDate);
      const tournDate = new Date(formData.tournamentDate);

      if (regDate > tournDate) {
        setError("Registration open date must be before tournament date");
        return;
      }
    }

    // Prepare data for saving
    const sectionData = {
      ...formData,
      // Ensure capacity and maxTeams are the same
      capacity: formData.maxTeams ? parseInt(formData.maxTeams) : null,
      // Format price as a number
      price: formData.price ? parseFloat(formData.price) : null,
    };

    onSave(sectionData);
  };

  const handleDelete = () => {
    if (formData._id) {
      onDelete(formData._id);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay">
      <div className="pickleball-dialog-content">
        <h2>{section ? "Edit Division" : "Add Division"}</h2>

        {error && <div className="dialog-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Division Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Men's Doubles Division"
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
              placeholder="Describe this division, rules, requirements, etc."
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
            </div>
          </div>

          <div className="dialog-actions">
            {section && section._id && (
              <button
                type="button"
                className="delete-btn"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Delete
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
              {isSaving
                ? "Saving..."
                : section
                ? "Save Changes"
                : "Add Division"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PickleballSectionDialog;
