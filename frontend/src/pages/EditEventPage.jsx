// src/pages/EditEventPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEvents from "../hooks/useEvents";
import ImageGallery from "../components/ImageGallery";
import axios from "axios";
import "./styles/EditEventPage.css";

// Material UI imports
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Box,
  IconButton,
  Alert,
  FormGroup,
  Divider,
  Switch,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Get API URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function EditEventPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;
  const { getEvent, createEvent, updateEvent, loading, error } = useEvents();

  // State variables
  const [successMessage, setSuccessMessage] = useState("");
  const [eventId, setEventId] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    isPublished: false,
    includeStartTime: false,
    includeEndTime: false,
    imageGallery: [],
    sections: [],
  });

  // Fetch event data when component loads in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchEventData();
      // Removed the separate fetchEventImages call since images are included in event data
    }
  }, [slug, getEvent, isEditMode]);

  // Function to fetch event data
  const fetchEventData = async () => {
    try {
      const response = await getEvent(slug);
      const event = response.data;

      if (event) {
        setEventId(event._id);

        // IMPORTANT: Set gallery images from the event data
        if (event.imageGallery && event.imageGallery.length > 0) {
          console.log(
            "Setting gallery images from event data:",
            event.imageGallery
          );
          setGalleryImages(event.imageGallery);
        }

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
  };

  // Function to handle image deletion
  const handleDeleteImage = async (imageId) => {
    if (!slug || !imageId) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/events/${slug}/images/${imageId}`
      );

      console.log("Delete image response:", response.data);

      if (response.data && response.data.success) {
        // Remove the deleted image from the state
        setGalleryImages((prevImages) =>
          prevImages.filter((img) => img._id !== imageId)
        );
        return true;
      }
      throw new Error(response.data?.message || "Failed to delete image");
    } catch (error) {
      console.error("Failed to delete image:", error);
      throw error;
    }
  };

  // Function to handle newly uploaded image
  const handleImageUploaded = (newImage) => {
    console.log("New image uploaded:", newImage);
    setGalleryImages((prevImages) => [...prevImages, newImage]);
  };

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

  // Section management functions
  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData({ ...formData, sections: updatedSections });
  };

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

  const removeSection = (index) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updatedSections });
  };

  // Form validation
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

  // Form submission handler
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
        imageGallery: galleryImages, // Use the galleryImages state instead of formData.imageGallery
      };

      console.log(
        "Submitting event with gallery images:",
        galleryImages.length
      );

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

  // Component for Basic Info section
  const BasicInfoSection = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>

      <TextField
        label="Event Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={4}
        margin="normal"
      />

      <TextField
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <FormGroup sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.isPublished}
              onChange={handleChange}
              name="isPublished"
              color="primary"
            />
          }
          label="Publish Event"
        />
      </FormGroup>
    </Paper>
  );

  // Component for Dates and Times section
  const DatesAndTimesSection = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Event Dates and Times
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Start Date"
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <Box sx={{ ml: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.includeStartTime}
                onChange={handleChange}
                name="includeStartTime"
                disabled={!formData.startDate}
              />
            }
            label="Include start time"
          />

          {formData.includeStartTime && formData.startDate && (
            <TextField
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required={formData.includeStartTime}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="End Date"
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <Box sx={{ ml: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.includeEndTime}
                onChange={handleChange}
                name="includeEndTime"
                disabled={!formData.endDate}
              />
            }
            label="Include end time"
          />

          {formData.includeEndTime && formData.endDate && (
            <TextField
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required={formData.includeEndTime}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );

  // Component for Image Gallery section
  const EventImageGallerySection = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Image Gallery
      </Typography>

      {/* Pass the slug to the image gallery component */}
      <ImageGallery
        eventSlug={slug}
        images={galleryImages}
        onDeleteImage={handleDeleteImage}
        onImageUploaded={handleImageUploaded}
      />

      {/* Debug information - helpful for troubleshooting */}
      {/* <Box sx{{ mt: 2, p: 2, border: "1px dashed #ccc", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Debug Info: {galleryImages.length} images loaded
        </Typography>
        {galleryImages.length > 0 && (
          <Box
            component="pre"
            sx={{
              fontSize: "0.7rem",
              mt: 1,
              p: 1,
              bgcolor: "#f5f5f5",
              maxHeight: "100px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(galleryImages[0], null, 2)}
          </Box>
        )}

        {galleryImages.length > 0 && (
          <Box sx={{ mt: 2, p: 2, border: "1px dashed #ccc", borderRadius: 1 }}>
            <Typography variant="subtitle2">Debug: Image URLs</Typography>
            {galleryImages.map((img, idx) => (
              <Box key={idx} sx={{ fontSize: "0.75rem" }}>
                {idx + 1}. {img.imageUrl}
              </Box>
            ))}
          </Box>
        )}
      </Box> */}
    </Paper>
  );

  // Component for a single event section editor
  const EventSectionItem = ({ section, index }) => (
    <Paper
      key={`section-${index}`}
      variant="outlined"
      sx={{ p: 2, mb: 2, position: "relative" }}
    >
      <IconButton
        size="small"
        color="error"
        onClick={() => removeSection(index)}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <DeleteIcon />
      </IconButton>

      <Typography variant="subtitle1" gutterBottom>
        Section {index + 1}
      </Typography>

      <TextField
        label="Section Title"
        value={section.title}
        onChange={(e) => handleSectionChange(index, "title", e.target.value)}
        fullWidth
        margin="normal"
        size="small"
      />

      <TextField
        label="Description"
        value={section.description}
        onChange={(e) =>
          handleSectionChange(index, "description", e.target.value)
        }
        fullWidth
        multiline
        rows={3}
        margin="normal"
        size="small"
      />

      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <TextField
          label="Capacity"
          type="number"
          value={section.capacity}
          onChange={(e) =>
            handleSectionChange(index, "capacity", e.target.value)
          }
          placeholder="Leave blank for unlimited"
          InputProps={{ inputProps: { min: 0 } }}
          fullWidth
          margin="normal"
          size="small"
        />

        <TextField
          label="Registration Open Date"
          type="date"
          value={section.registrationOpenDate}
          onChange={(e) =>
            handleSectionChange(index, "registrationOpenDate", e.target.value)
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="normal"
          size="small"
        />
      </Box>
    </Paper>
  );

  // Component for Event Sections
  const EventSectionsSection = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Event Sections</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          onClick={addSection}
          size="small"
        >
          Add Section
        </Button>
      </Box>

      {formData.sections.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic", mb: 2 }}
        >
          No sections added yet.
        </Typography>
      ) : (
        formData.sections.map((section, index) => (
          <EventSectionItem key={index} section={section} index={index} />
        ))
      )}
    </Paper>
  );

  // Form action buttons
  const FormActionButtons = () => (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/events")}
      >
        Cancel
      </Button>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        startIcon={
          loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SaveIcon />
          )
        }
        disabled={loading}
      >
        {loading ? "Saving..." : isEditMode ? "Update Event" : "Create Event"}
      </Button>
    </Box>
  );

  return (
    <div className="edit-event-container">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          {isEditMode ? "Edit Event" : "Create New Event"}
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <BasicInfoSection />
        <DatesAndTimesSection />
        {isEditMode && <EventImageGallerySection />}
        <EventSectionsSection />
        <FormActionButtons />
      </form>
    </div>
  );
}

export default EditEventPage;
