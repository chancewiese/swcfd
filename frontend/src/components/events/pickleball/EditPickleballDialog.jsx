// src/components/events/pickleball/EditPickleballDialog.jsx
import { useState, useEffect } from "react";
import "./PickleballDialog.css";
import { IconButton, Checkbox, FormControlLabel } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

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
    eventDates: [],
    isPublished: true,
  });

  const [error, setError] = useState("");

  // Initialize form when event data changes
  useEffect(() => {
    if (eventData) {
      // Convert old startDate/endDate format to eventDates array if needed
      let dates = [];
      if (eventData.eventDates && eventData.eventDates.length > 0) {
        dates = eventData.eventDates.map((d) => ({
          startDate: new Date(d.startDate).toISOString().split("T")[0],
          endDate: new Date(d.endDate).toISOString().split("T")[0],
          isSingleDay: d.startDate === d.endDate,
        }));
      } else if (eventData.startDate && eventData.endDate) {
        // Legacy support: convert old single date range to new format
        const start = new Date(eventData.startDate).toISOString().split("T")[0];
        const end = new Date(eventData.endDate).toISOString().split("T")[0];
        dates = [
          {
            startDate: start,
            endDate: end,
            isSingleDay: start === end,
          },
        ];
      }

      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        location: eventData.location || "",
        pricePerTeam: eventData.pricePerTeam || "25",
        eventDates: dates,
        isPublished:
          eventData.isPublished !== undefined ? eventData.isPublished : true,
      });
    }
  }, [eventData, isOpen]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For numeric inputs, ensure they're numbers
    if (name === "pricePerTeam") {
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

  const handleDateChange = (index, field, value) => {
    const updatedDates = [...formData.eventDates];
    updatedDates[index][field] = value;

    // If it's a single day event, sync the end date with start date
    if (updatedDates[index].isSingleDay && field === "startDate") {
      updatedDates[index].endDate = value;
    }

    setFormData({
      ...formData,
      eventDates: updatedDates,
    });
  };

  const handleSingleDayToggle = (index) => {
    const updatedDates = [...formData.eventDates];
    updatedDates[index].isSingleDay = !updatedDates[index].isSingleDay;

    // If toggling to single day, set end date same as start date
    if (updatedDates[index].isSingleDay) {
      updatedDates[index].endDate = updatedDates[index].startDate;
    }

    setFormData({
      ...formData,
      eventDates: updatedDates,
    });
  };

  const handleAddDate = () => {
    setFormData({
      ...formData,
      eventDates: [
        ...formData.eventDates,
        { startDate: "", endDate: "", isSingleDay: false },
      ],
    });
  };

  const handleRemoveDate = (index) => {
    const updatedDates = formData.eventDates.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      eventDates: updatedDates,
    });
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

    // Validate dates
    if (formData.eventDates.length > 0) {
      for (let i = 0; i < formData.eventDates.length; i++) {
        const dateRange = formData.eventDates[i];
        if (!dateRange.startDate) {
          setError(`Date ${i + 1} must have a start date`);
          return;
        }
        if (!dateRange.isSingleDay && !dateRange.endDate) {
          setError(
            `Date ${i + 1} must have an end date or be marked as single day`,
          );
          return;
        }
        if (
          !dateRange.isSingleDay &&
          new Date(dateRange.startDate) > new Date(dateRange.endDate)
        ) {
          setError(`Date ${i + 1}: end date must be after start date`);
          return;
        }
      }
    }

    // Validate price format if provided
    if (formData.pricePerTeam && isNaN(parseFloat(formData.pricePerTeam))) {
      setError("Price must be a valid number");
      return;
    }

    // Sort dates before saving
    const sortedDates = [...formData.eventDates].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate),
    );

    // Format data for saving
    const formattedData = {
      ...formData,
      eventDates: sortedDates,
      pricePerTeam: formData.pricePerTeam
        ? `$${parseFloat(formData.pricePerTeam)} per team`
        : "$25 per team",
      // Also set startDate and endDate to first date range for backward compatibility
      startDate: sortedDates.length > 0 ? sortedDates[0].startDate : null,
      endDate: sortedDates.length > 0 ? sortedDates[0].endDate : null,
    };

    onSave(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay" onClick={onClose}>
      <div
        className="pickleball-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Edit Tournament</h2>

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
              placeholder="e.g., Annual Pickleball Tournament"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              disabled={isSaving}
              placeholder="Describe the tournament..."
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
              disabled={isSaving}
              placeholder="e.g., City Park Pickleball Courts"
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
              min="0"
              step="0.01"
              disabled={isSaving}
              placeholder="25"
            />
          </div>

          <div className="form-group">
            <div className="dates-header">
              <label>Tournament Dates</label>
              <button
                type="button"
                className="add-date-button"
                onClick={handleAddDate}
                disabled={isSaving}
              >
                <AddIcon sx={{ fontSize: "1rem", marginRight: "0.25rem" }} />
                Add Date
              </button>
            </div>

            {formData.eventDates.length === 0 ? (
              <div className="no-dates-message">
                No dates added yet. Click "Add Date" to add tournament dates.
              </div>
            ) : (
              <div className="dates-list">
                {/* Don't sort during editing - keep in original order */}
                {formData.eventDates.map((dateRange, index) => (
                  <div key={index} className="date-range-item">
                    <div className="date-inputs-container">
                      <div className="date-inputs">
                        <div className="date-input-group">
                          <label>Start Date</label>
                          <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) =>
                              handleDateChange(
                                index,
                                "startDate",
                                e.target.value,
                              )
                            }
                            disabled={isSaving}
                          />
                        </div>
                        <div className="date-input-group">
                          <label>End Date</label>
                          <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) =>
                              handleDateChange(index, "endDate", e.target.value)
                            }
                            disabled={isSaving || dateRange.isSingleDay}
                          />
                        </div>
                      </div>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={dateRange.isSingleDay}
                            onChange={() => handleSingleDayToggle(index)}
                            disabled={isSaving}
                          />
                        }
                        label="Single day event"
                        className="single-day-checkbox"
                      />
                    </div>
                    <IconButton
                      onClick={() => handleRemoveDate(index)}
                      disabled={isSaving}
                      color="error"
                      size="small"
                      aria-label="delete date"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
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
