// src/components/sponsors/SponsorDialog.jsx
import { useState, useEffect } from "react";
import { getImageUrl } from "../../utils/imageUtils";
import "../../components/events/pickleball/PickleballDialog.css";

const SponsorDialog = ({
  isOpen,
  onClose,
  sponsor,
  tier,
  onSave,
  onDelete,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    website: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setLogoFile(null);
      setLogoPreview(null);
      setFormData({
        name: sponsor?.name || "",
        website: sponsor?.website || "",
      });
    }
  }, [isOpen, sponsor]);

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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    onSave(formData, logoFile);
  };

  const handleDelete = () => {
    if (
      sponsor?._id &&
      window.confirm(
        `Are you sure you want to delete "${sponsor.name}"?`,
      )
    ) {
      onDelete(sponsor._id);
    }
  };

  if (!isOpen) return null;

  const existingLogoUrl = sponsor?.logoUrl ? getImageUrl(sponsor.logoUrl) : null;

  return (
    <div className="pickleball-dialog-overlay" onClick={onClose}>
      <div
        className="pickleball-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>
          {sponsor ? "Edit Sponsor" : `Add Sponsor${tier ? ` — ${tier.name}` : ""}`}
        </h2>

        {error && <div className="dialog-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="sponsor-name">Sponsor Name</label>
            <input
              type="text"
              id="sponsor-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="e.g., Acme Corp"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sponsor-website">Website (optional)</label>
            <input
              type="url"
              id="sponsor-website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="https://www.example.com"
            />
          </div>

          <div className="form-group">
            <label>Logo</label>

            {/* Show existing logo if present and no new preview */}
            {existingLogoUrl && !logoPreview && (
              <div style={{ marginBottom: "0.75rem" }}>
                <p className="help-text" style={{ marginBottom: "0.4rem" }}>Current logo:</p>
                <img
                  src={existingLogoUrl}
                  alt={`${sponsor.name} logo`}
                  style={{
                    maxWidth: "160px",
                    maxHeight: "80px",
                    objectFit: "contain",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    padding: "4px",
                    display: "block",
                  }}
                />
              </div>
            )}

            {/* New logo preview */}
            {logoPreview && (
              <div style={{ marginBottom: "0.75rem" }}>
                <p className="help-text" style={{ marginBottom: "0.4rem" }}>New logo preview:</p>
                <img
                  src={logoPreview}
                  alt="New logo preview"
                  style={{
                    maxWidth: "160px",
                    maxHeight: "80px",
                    objectFit: "contain",
                    border: "1px solid #1976d2",
                    borderRadius: "4px",
                    padding: "4px",
                    display: "block",
                  }}
                />
              </div>
            )}

            <input
              type="file"
              id="sponsor-logo"
              accept="image/*"
              onChange={handleLogoChange}
              disabled={isSaving}
              style={{ fontSize: "0.9rem" }}
            />
            <span className="help-text">
              {existingLogoUrl
                ? "Upload a new logo to replace the existing one."
                : "Upload a logo image for this sponsor (optional)."}
            </span>
          </div>

          <div className="dialog-actions">
            {sponsor && (
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
              {isSaving ? "Saving..." : sponsor ? "Save Changes" : "Add Sponsor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SponsorDialog;
