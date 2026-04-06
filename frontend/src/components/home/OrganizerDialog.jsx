// src/components/home/OrganizerDialog.jsx
import { useState, useEffect } from "react";
import "../../components/events/pickleball/PickleballDialog.css";

const OrganizerDialog = ({
  isOpen,
  onClose,
  organizer,
  onSave,
  onDelete,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setFormData({
        name: organizer?.name || "",
        role: organizer?.role || "",
        phone: organizer?.phone || "",
        email: organizer?.email || "",
      });
    }
  }, [isOpen, organizer]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isSaving) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, isSaving, onClose]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (
      organizer?._id &&
      window.confirm("Are you sure you want to remove this organizer?")
    ) {
      onDelete(organizer._id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay" onClick={onClose}>
      <div
        className="pickleball-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{organizer ? "Edit Organizer" : "Add Organizer"}</h2>

        {error && <div className="dialog-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="org-name">Name</label>
            <input
              type="text"
              id="org-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="e.g., Jane Smith"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="org-role">Role / Title</label>
            <input
              type="text"
              id="org-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="e.g., Event Coordinator"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="org-phone">Phone</label>
              <input
                type="tel"
                id="org-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="e.g., (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="org-email">Email</label>
              <input
                type="email"
                id="org-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="e.g., jane@example.com"
              />
            </div>
          </div>

          <div className="dialog-actions">
            {organizer && (
              <button
                type="button"
                className="delete-btn"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Remove
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
              {isSaving ? "Saving..." : organizer ? "Save Changes" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerDialog;
