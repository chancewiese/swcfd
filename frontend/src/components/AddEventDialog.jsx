// frontend/src/components/AddEventDialog.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useEvents from "../hooks/useEvents";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

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
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 500 }}>Create New Event</DialogTitle>

      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form id="add-event-form" onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            id="event-title"
            label="Event Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mt: 1 }}
          />
          <Box sx={{ mt: 1, color: "text.secondary", fontSize: "0.875rem" }}>
            You'll be able to add more details after creating the event.
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-event-form"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {loading ? "Creating..." : "Create & Edit Details"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddEventDialog;
