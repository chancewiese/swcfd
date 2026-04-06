// src/components/sponsors/TierDialog.jsx
import { useState, useEffect } from "react";
import "../../components/events/pickleball/PickleballDialog.css";

const TierDialog = ({ isOpen, onClose, tier, onSave, onDelete, isSaving }) => {
  const [formData, setFormData] = useState({
    name: "",
    contributionRange: "",
    description: "",
    color: "#1976d2",
  });
  const [benefits, setBenefits] = useState([]);
  const [newBenefit, setNewBenefit] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setNewBenefit("");
      setFormData({
        name: tier?.name || "",
        contributionRange: tier?.contributionRange || "",
        description: tier?.description || "",
        color: tier?.color || "#1976d2",
      });
      setBenefits(tier?.benefits ? [...tier.benefits] : []);
    }
  }, [isOpen, tier]);

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

  const handleAddBenefit = () => {
    const trimmed = newBenefit.trim();
    if (!trimmed) return;
    setBenefits([...benefits, trimmed]);
    setNewBenefit("");
  };

  const handleBenefitKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddBenefit();
    }
  };

  const handleRemoveBenefit = (index) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    onSave({ ...formData, benefits });
  };

  const handleDelete = () => {
    if (
      tier?._id &&
      window.confirm(
        `Are you sure you want to delete the "${tier.name}" tier? All sponsors in this tier will also be deleted.`,
      )
    ) {
      onDelete(tier._id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay" onClick={onClose}>
      <div
        className="pickleball-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{tier ? "Edit Tier" : "Add Tier"}</h2>

        {error && <div className="dialog-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tier-name">Tier Name</label>
            <input
              type="text"
              id="tier-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="e.g., Gold Sponsor"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tier-range">Contribution Range</label>
              <input
                type="text"
                id="tier-range"
                name="contributionRange"
                value={formData.contributionRange}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="e.g., $1,000+"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tier-color">Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="text"
                  id="tier-color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="#D4AF37"
                  style={{ flex: 1 }}
                />
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    backgroundColor: formData.color,
                    border: "1px solid #ddd",
                    flexShrink: 0,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tier-description">Description (optional)</label>
            <textarea
              id="tier-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Additional notes about this sponsorship tier..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Benefits</label>
            {benefits.length > 0 ? (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "#f5f5f5",
                      borderRadius: "4px",
                      padding: "0.4rem 0.6rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ flex: 1 }}>{benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      disabled={isSaving}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#c62828",
                        cursor: "pointer",
                        fontSize: "1rem",
                        lineHeight: 1,
                        padding: "0 0.2rem",
                        flexShrink: 0,
                      }}
                      title="Remove benefit"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className="help-text"
                style={{ marginBottom: "0.75rem" }}
              >
                No benefits added yet.
              </p>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={handleBenefitKeyDown}
                disabled={isSaving}
                placeholder="Add a benefit..."
                style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.9rem" }}
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                disabled={isSaving || !newBenefit.trim()}
                style={{
                  background: "var(--primary-color, #1976d2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div className="dialog-actions">
            {tier && (
              <button
                type="button"
                className="delete-btn"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Delete Tier
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
              {isSaving ? "Saving..." : tier ? "Save Changes" : "Add Tier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TierDialog;
