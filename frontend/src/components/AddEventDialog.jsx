// frontend/src/components/AddEventDialog.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useEvents from "../hooks/useEvents";
import "./AddEventDialog.css";

function AddEventDialog({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { createEvent, loading, error } = useEvents();

  const [title, setTitle] = useState("");
  const [submitError, setSubmitError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setSubmitError("Please enter an event title");
      return;
    }

    try {
      // Create event with minimal data - just the title
      const response = await createEvent({
        title,
        description: "",
        location: "",
        isPublished: false,
        imageGallery: [],
        sections: [],
      });

      // Navigate to the edit page for the newly created event
      if (response && response.data && response.data.titleSlug) {
        navigate(`/events/edit/${response.data.titleSlug}`);
      } else {
        onClose();
      }
    } catch (err) {
      setSubmitError(err.message || "Failed to create event");
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Event</h2>

        {submitError && <div className="error-message">{submitError}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="event-title">Event Title</label>
            <input
              type="text"
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              autoFocus
              required
            />
          </div>

          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create & Edit Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEventDialog;
