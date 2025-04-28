// src/components/events/pickleball/PickleballSectionDialog.jsx
import { useState, useEffect } from "react";
import "./PickleballDialog.css";

const PickleballSectionDialog = ({
  isOpen,
  onClose,
  section,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    maxTeams: "",
    registrationOpenDate: "",
    tournamentDate: "",
    tournamentTime: "",
  });

  const [error, setError] = useState("");

  // Initialize form data when section changes
  useEffect(() => {
    if (section) {
      setFormData({
        id: section.id || Date.now().toString(),
        title: section.title || "",
        maxTeams: section.maxTeams || "",
        registrationOpenDate: section.registrationOpenDate || "",
        tournamentDate: section.tournamentDate || "",
        tournamentTime: section.tournamentTime || "",
      });
    } else {
      // New section defaults
      setFormData({
        id: Date.now().toString(),
        title: "",
        maxTeams: "",
        registrationOpenDate: "",
        tournamentDate: "",
        tournamentTime: "",
      });
    }
  }, [section, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.title.trim()) {
      setError("Section title is required");
      return;
    }

    // Make sure maxTeams is a number if provided
    if (formData.maxTeams && isNaN(parseInt(formData.maxTeams))) {
      setError("Maximum teams must be a number");
      return;
    }

    onSave(formData);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      onDelete(formData.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay">
      <div className="pickleball-dialog-content">
        <h2>{section ? "Edit Section" : "Add Section"}</h2>

        {error && <div className="dialog-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Section Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Men's Doubles Division"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxTeams">Maximum Teams</label>
            <input
              type="number"
              id="maxTeams"
              name="maxTeams"
              value={formData.maxTeams}
              onChange={handleInputChange}
              placeholder="e.g., 24"
            />
          </div>

          <div className="form-group">
            <label htmlFor="registrationOpenDate">Registration Opens</label>
            <input
              type="date"
              id="registrationOpenDate"
              name="registrationOpenDate"
              value={formData.registrationOpenDate}
              onChange={handleInputChange}
            />
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
              />
            </div>
          </div>

          <div className="dialog-actions">
            {section && (
              <button
                type="button"
                className="delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {section ? "Save Changes" : "Add Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PickleballSectionDialog;
