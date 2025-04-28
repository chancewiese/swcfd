// src/components/events/pickleball/EditSectionDialog.jsx
import { useState, useEffect } from "react";
import "./SectionDialog.css";

const EditSectionDialog = ({ isOpen, onClose, section, onSave }) => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    content: "",
    icon: "",
    hasRegistration: false,
  });

  const [error, setError] = useState("");

  // Initialize form data when section changes
  useEffect(() => {
    if (section) {
      setFormData({
        id: section.id || "",
        title: section.title || "",
        content: section.content || "",
        icon: section.icon || "",
        hasRegistration: section.hasRegistration || false,
      });
    }
  }, [section]);

  const handleChange = (e) => {
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
      setError("Section title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Section content is required");
      return;
    }

    onSave(formData);
  };

  const iconOptions = [
    { value: "", label: "None" },
    { value: "info-circle", label: "Info" },
    { value: "users", label: "Users" },
    { value: "clipboard-list", label: "Clipboard" },
    { value: "calendar", label: "Calendar" },
    { value: "trophy", label: "Trophy" },
    { value: "map-marker-alt", label: "Location" },
    { value: "star", label: "Star" },
    { value: "bell", label: "Bell" },
  ];

  if (!isOpen) return null;

  return (
    <div className="section-dialog-overlay">
      <div className="section-dialog-content">
        <h2>{formData.id ? "Edit Section" : "Add New Section"}</h2>

        {error && <div className="dialog-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Section Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter section title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="icon">Icon</label>
            <select
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="help-text">
              Icon will be displayed next to the section title
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="8"
              required
              placeholder="Enter section content. Use line breaks for paragraphs."
            ></textarea>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasRegistration"
                checked={formData.hasRegistration}
                onChange={handleChange}
              />
              Show Registration Button
            </label>
          </div>

          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {formData.id ? "Save Changes" : "Add Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSectionDialog;
