// frontend/src/pages/EditEventPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEvents from "../hooks/useEvents";
import "./styles/EditEventPage.css";

function EditEventPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;
  const { getEvent, createEvent, updateEvent, loading, error } = useEvents();
  const [successMessage, setSuccessMessage] = useState("");
  const [eventId, setEventId] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "", // Empty string indicates no date selected
    startTime: "", // Empty string indicates no time
    endDate: "", // Empty string indicates no date selected
    endTime: "", // Empty string indicates no time
    isPublished: false, // Default to unpublished
    includeStartTime: false, // Default to not including time
    includeEndTime: false, // Default to not including time
    imageGallery: [],
    sections: [],
  });

  // Fetch event data when in edit mode
  useEffect(() => {
    const fetchEvent = async () => {
      if (isEditMode) {
        try {
          const response = await getEvent(slug);
          const event = response.data;

          if (event) {
            setEventId(event._id);

            // Initialize form data
            const formDataInitial = {
              title: event.title || "",
              description: event.description || "",
              location: event.location || "",
              startDate: "",
              startTime: "",
              endDate: "",
              endTime: "",
              isPublished:
                event.isPublished !== undefined ? event.isPublished : false,
              includeStartTime: false,
              includeEndTime: false,
              imageGallery:
                event.imageGallery && event.imageGallery.length > 0
                  ? event.imageGallery
                  : [],
              sections:
                event.sections && event.sections.length > 0
                  ? event.sections.map((section) => ({
                      ...section,
                      registrationOpenDate: section.registrationOpenDate
                        ? new Date(section.registrationOpenDate)
                            .toISOString()
                            .split("T")[0]
                        : "",
                    }))
                  : [],
            };

            // If dates exist, format them
            if (event.startDate) {
              const startDate = new Date(event.startDate);
              formDataInitial.startDate = startDate.toISOString().split("T")[0];

              // Check if time is midnight to determine if time was included
              const startTimeStr = startDate.toTimeString().substring(0, 5);
              formDataInitial.includeStartTime = startTimeStr !== "00:00";
              if (formDataInitial.includeStartTime) {
                formDataInitial.startTime = startTimeStr;
              }
            }

            if (event.endDate) {
              const endDate = new Date(event.endDate);
              formDataInitial.endDate = endDate.toISOString().split("T")[0];

              // Check if time is 23:59:59 to determine if time was included
              const endTimeStr = endDate.toTimeString().substring(0, 5);
              formDataInitial.includeEndTime = endTimeStr !== "23:59";
              if (formDataInitial.includeEndTime) {
                formDataInitial.endTime = endTimeStr;
              }
            }

            setFormData(formDataInitial);
          }
        } catch (err) {
          console.error("Failed to fetch event:", err);
        }
      }
    };

    fetchEvent();
  }, [slug, getEvent, isEditMode]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "includeStartTime" && !checked) {
      // If unchecking includeStartTime, reset startTime
      setFormData({
        ...formData,
        includeStartTime: false,
        startTime: "",
      });
    } else if (name === "includeEndTime" && !checked) {
      // If unchecking includeEndTime, reset endTime
      setFormData({
        ...formData,
        includeEndTime: false,
        endTime: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Handle image gallery changes
  const handleImageChange = (index, field, value) => {
    const updatedGallery = [...formData.imageGallery];
    updatedGallery[index] = { ...updatedGallery[index], [field]: value };
    setFormData({ ...formData, imageGallery: updatedGallery });
  };

  // Add a new image to the gallery
  const addImage = () => {
    setFormData({
      ...formData,
      imageGallery: [...formData.imageGallery, { name: "", imageUrl: "" }],
    });
  };

  // Remove an image from the gallery
  const removeImage = (index) => {
    const updatedGallery = formData.imageGallery.filter((_, i) => i !== index);
    setFormData({ ...formData, imageGallery: updatedGallery });
  };

  // Handle section field changes
  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData({ ...formData, sections: updatedSections });
  };

  // Add a new section
  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        {
          title: "",
          description: "",
          capacity: "",
          registrationOpenDate: "",
        },
      ],
    });
  };

  // Remove a section
  const removeSection = (index) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updatedSections });
  };

  // Add date validation function
  const validateDates = () => {
    // If both dates are empty, that's fine (no dates required)
    if (!formData.startDate && !formData.endDate) {
      return { valid: true };
    }

    // If one date is provided, both should be provided
    if (
      (!formData.startDate && formData.endDate) ||
      (formData.startDate && !formData.endDate)
    ) {
      return {
        valid: false,
        message:
          "If you provide one date, you must provide both start and end dates",
      };
    }

    // If both dates are provided, validate that end is after start
    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(
        `${formData.startDate}${
          formData.includeStartTime && formData.startTime
            ? "T" + formData.startTime
            : "T00:00:00"
        }`
      );

      const endDateTime = new Date(
        `${formData.endDate}${
          formData.includeEndTime && formData.endTime
            ? "T" + formData.endTime
            : "T23:59:59"
        }`
      );

      if (endDateTime <= startDateTime) {
        return {
          valid: false,
          message: "End date/time must be after start date/time",
        };
      }
    }

    return { valid: true };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    // Validate title
    if (!formData.title.trim()) {
      return; // Form validation will catch this
    }

    // Validate dates
    const dateValidation = validateDates();
    if (!dateValidation.valid) {
      setValidationError(dateValidation.message);
      return;
    }

    try {
      // Format the data for API
      const eventData = {
        ...formData,
      };

      // Only add dates if they're provided
      if (formData.startDate) {
        eventData.startDate = new Date(
          `${formData.startDate}${
            formData.includeStartTime && formData.startTime
              ? "T" + formData.startTime
              : "T00:00:00"
          }`
        ).toISOString();
      } else {
        eventData.startDate = null;
      }

      if (formData.endDate) {
        eventData.endDate = new Date(
          `${formData.endDate}${
            formData.includeEndTime && formData.endTime
              ? "T" + formData.endTime
              : "T23:59:59"
          }`
        ).toISOString();
      } else {
        eventData.endDate = null;
      }

      // Format sections
      eventData.sections = formData.sections.map((section) => ({
        ...section,
        capacity: section.capacity ? Number(section.capacity) : null,
        registrationOpenDate: section.registrationOpenDate
          ? new Date(section.registrationOpenDate).toISOString()
          : null,
      }));

      // Remove temporary fields
      delete eventData.startTime;
      delete eventData.endTime;
      delete eventData.includeStartTime;
      delete eventData.includeEndTime;

      if (isEditMode) {
        // Use slug for update
        await updateEvent(slug, eventData);
        setSuccessMessage("Event updated successfully!");
      } else {
        const response = await createEvent(eventData);
        setSuccessMessage("Event created successfully!");

        // Navigate to the event page
        if (response && response.data && response.data.titleSlug) {
          setTimeout(() => {
            navigate(`/events/${response.data.titleSlug}`);
          }, 2000);
          return;
        }
      }

      // Navigate back to events page after a short delay
      setTimeout(() => {
        navigate("/events");
      }, 2000);
    } catch (err) {
      console.error("Failed to save event:", err);
      // Error is handled by useEvents hook
    }
  };

  return (
    <div className="edit-event-container">
      <h1>{isEditMode ? "Edit Event" : "Create New Event"}</h1>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {error && <div className="error-alert">Error: {error}</div>}
      {validationError && (
        <div className="error-alert">Error: {validationError}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group time-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="includeStartTime"
                name="includeStartTime"
                checked={formData.includeStartTime}
                onChange={handleChange}
                disabled={!formData.startDate} // Disable if no date selected
              />
              <label htmlFor="includeStartTime">Include start time</label>
            </div>

            {formData.includeStartTime && formData.startDate && (
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required={formData.includeStartTime}
              />
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group time-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="includeEndTime"
                name="includeEndTime"
                checked={formData.includeEndTime}
                onChange={handleChange}
                disabled={!formData.endDate} // Disable if no date selected
              />
              <label htmlFor="includeEndTime">Include end time</label>
            </div>

            {formData.includeEndTime && formData.endDate && (
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required={formData.includeEndTime}
              />
            )}
          </div>
        </div>

        <div className="form-group publish-checkbox">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            <span className="checkbox-label">Publish Event</span>
          </label>
        </div>

        <h2>Image Gallery</h2>
        {formData.imageGallery.length === 0 ? (
          <p className="empty-section-message">No images added yet.</p>
        ) : (
          formData.imageGallery.map((image, index) => (
            <div key={`image-${index}`} className="section-card">
              <h3>Image {index + 1}</h3>
              <button
                type="button"
                className="remove-section-btn"
                onClick={() => removeImage(index)}
              >
                ×
              </button>

              <div className="form-group">
                <label htmlFor={`image-name-${index}`}>Image Name</label>
                <input
                  type="text"
                  id={`image-name-${index}`}
                  value={image.name}
                  onChange={(e) =>
                    handleImageChange(index, "name", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor={`image-url-${index}`}>Image URL</label>
                <input
                  type="text"
                  id={`image-url-${index}`}
                  value={image.imageUrl}
                  onChange={(e) =>
                    handleImageChange(index, "imageUrl", e.target.value)
                  }
                  placeholder="Use placeholder path like: /api/placeholder/800/400"
                />
              </div>
            </div>
          ))
        )}

        <button type="button" className="add-section-btn" onClick={addImage}>
          Add Image
        </button>

        <h2>Event Sections</h2>
        {formData.sections.length === 0 ? (
          <p className="empty-section-message">No sections added yet.</p>
        ) : (
          formData.sections.map((section, index) => (
            <div key={`section-${index}`} className="section-card">
              <h3>Section {index + 1}</h3>
              <button
                type="button"
                className="remove-section-btn"
                onClick={() => removeSection(index)}
              >
                ×
              </button>

              <div className="form-group">
                <label htmlFor={`section-title-${index}`}>Section Title</label>
                <input
                  type="text"
                  id={`section-title-${index}`}
                  value={section.title}
                  onChange={(e) =>
                    handleSectionChange(index, "title", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor={`section-description-${index}`}>
                  Description
                </label>
                <textarea
                  id={`section-description-${index}`}
                  value={section.description}
                  onChange={(e) =>
                    handleSectionChange(index, "description", e.target.value)
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`section-capacity-${index}`}>Capacity</label>
                  <input
                    type="number"
                    id={`section-capacity-${index}`}
                    value={section.capacity}
                    onChange={(e) =>
                      handleSectionChange(index, "capacity", e.target.value)
                    }
                    min="0"
                    placeholder="Leave blank for unlimited"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`section-registration-${index}`}>
                    Registration Open Date
                  </label>
                  <input
                    type="date"
                    id={`section-registration-${index}`}
                    value={section.registrationOpenDate}
                    onChange={(e) =>
                      handleSectionChange(
                        index,
                        "registrationOpenDate",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))
        )}

        <button type="button" className="add-section-btn" onClick={addSection}>
          Add Section
        </button>

        <div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Event"
              : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEventPage;
