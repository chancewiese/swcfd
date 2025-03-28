// src/pages/EditEventPage.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAPI from "../hooks/useAPI";
import "./styles/EditEventPage.css";

function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { createEvent, updateEvent, loading, error } = useAPI();
  const [successMessage, setSuccessMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "17:00",
    isPublished: true,
    imageGallery: [{ name: "", imageUrl: "" }],
    sections: [
      {
        title: "",
        description: "",
        capacity: "",
        registrationOpenDate: "",
      },
    ],
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format the data for API
      const eventData = {
        ...formData,
        // Combine date and time for startDate
        startDate: new Date(
          `${formData.startDate}T${formData.startTime}`
        ).toISOString(),
        // Combine date and time for endDate
        endDate: new Date(
          `${formData.endDate}T${formData.endTime}`
        ).toISOString(),
        // Format sections - remove empty values and convert capacity to number
        sections: formData.sections.map((section) => ({
          ...section,
          capacity: section.capacity ? Number(section.capacity) : null,
          registrationOpenDate: section.registrationOpenDate
            ? new Date(section.registrationOpenDate).toISOString()
            : null,
        })),
      };

      // Remove temporary fields
      delete eventData.startTime;
      delete eventData.endTime;

      if (isEditMode) {
        await updateEvent(id, eventData);
        setSuccessMessage("Event updated successfully!");
      } else {
        await createEvent(eventData);
        setSuccessMessage("Event created successfully!");

        // Reset form after successful creation
        setFormData({
          title: "",
          description: "",
          location: "",
          startDate: "",
          startTime: "09:00",
          endDate: "",
          endTime: "17:00",
          isPublished: true,
          imageGallery: [{ name: "", imageUrl: "" }],
          sections: [
            {
              title: "",
              description: "",
              capacity: "",
              registrationOpenDate: "",
            },
          ],
        });
      }

      // Navigate back to events page after a short delay
      setTimeout(() => {
        navigate("/events");
      }, 2000);
    } catch (err) {
      console.error("Failed to save event:", err);
      // Error is handled by useAPI hook
    }
  };

  return (
    <div className="edit-event-container">
      <h1>{isEditMode ? "Edit Event" : "Create New Event"}</h1>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {error && <div className="error-alert">Error: {error}</div>}

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
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time *</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time *</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            Publish Event
          </label>
        </div>

        <h2>Image Gallery</h2>
        {formData.imageGallery.map((image, index) => (
          <div key={`image-${index}`} className="section-card">
            <h3>Image {index + 1}</h3>
            {index > 0 && (
              <button
                type="button"
                className="remove-section-btn"
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            )}

            <div className="form-group">
              <label htmlFor={`image-name-${index}`}>Image Name *</label>
              <input
                type="text"
                id={`image-name-${index}`}
                value={image.name}
                onChange={(e) =>
                  handleImageChange(index, "name", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`image-url-${index}`}>Image URL *</label>
              <input
                type="text"
                id={`image-url-${index}`}
                value={image.imageUrl}
                onChange={(e) =>
                  handleImageChange(index, "imageUrl", e.target.value)
                }
                placeholder="Use placeholder path like: /api/placeholder/800/400"
                required
              />
            </div>
          </div>
        ))}

        <button type="button" className="add-section-btn" onClick={addImage}>
          Add Image
        </button>

        <h2>Event Sections</h2>
        {formData.sections.map((section, index) => (
          <div key={`section-${index}`} className="section-card">
            <h3>Section {index + 1}</h3>
            {index > 0 && (
              <button
                type="button"
                className="remove-section-btn"
                onClick={() => removeSection(index)}
              >
                ×
              </button>
            )}

            <div className="form-group">
              <label htmlFor={`section-title-${index}`}>Section Title *</label>
              <input
                type="text"
                id={`section-title-${index}`}
                value={section.title}
                onChange={(e) =>
                  handleSectionChange(index, "title", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`section-description-${index}`}>
                Description *
              </label>
              <textarea
                id={`section-description-${index}`}
                value={section.description}
                onChange={(e) =>
                  handleSectionChange(index, "description", e.target.value)
                }
                required
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
        ))}

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
