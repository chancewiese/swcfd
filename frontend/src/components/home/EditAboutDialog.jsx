// src/components/home/EditAboutDialog.jsx
import { useState, useEffect } from "react";
import "../../components/events/pickleball/PickleballDialog.css";

const EditAboutDialog = ({ isOpen, onClose, content, onSave, isSaving }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setText(content || "");
    }
  }, [isOpen, content]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isSaving) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, isSaving, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(text);
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay" onClick={onClose}>
      <div
        className="pickleball-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Edit About</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="about-content">About Text</label>
            <textarea
              id="about-content"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="10"
              disabled={isSaving}
              placeholder="Write something about Country Fair Days..."
              style={{ resize: "vertical" }}
            />
            <small className="help-text">
              Use blank lines to separate paragraphs.
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
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAboutDialog;
