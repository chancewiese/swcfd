// src/components/EditEventSectionDialog.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

function EditEventSectionDialog({
  isOpen,
  onClose,
  onSave,
  section = null,
  isNew = true,
}) {
  // Initialize section data
  const [sectionData, setSectionData] = useState({
    title: "",
    description: "",
    capacity: "",
    registrationOpenDate: "",
  });

  const [loading, setLoading] = useState(false);

  // Update form data when section changes
  useEffect(() => {
    if (section) {
      setSectionData({
        title: section.title || "",
        description: section.description || "",
        capacity: section.capacity || "",
        registrationOpenDate: section.registrationOpenDate || "",
      });
    } else {
      // Reset form for new section
      setSectionData({
        title: "",
        description: "",
        capacity: "",
        registrationOpenDate: "",
      });
    }
  }, [section, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSectionData({
      ...sectionData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(sectionData);
      onClose();
    } catch (err) {
      console.error("Failed to save section:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {isNew ? "Add New Section" : "Edit Section"}
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            label="Section Title"
            name="title"
            value={sectionData.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Description"
            name="description"
            value={sectionData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />

          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <TextField
              label="Capacity"
              type="number"
              name="capacity"
              value={sectionData.capacity}
              onChange={handleChange}
              placeholder="Leave blank for unlimited"
              InputProps={{ inputProps: { min: 0 } }}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Registration Open Date"
              type="date"
              name="registrationOpenDate"
              value={sectionData.registrationOpenDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">
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
            {loading ? "Saving..." : "Save Section"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EditEventSectionDialog;
