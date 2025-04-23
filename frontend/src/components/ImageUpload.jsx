// src/components/ImageUpload.jsx
import { useState } from "react";
import { generateEventImagePath } from "../utils/imageUtils";
import axios from "axios";

// Material UI imports
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ImageIcon from "@mui/icons-material/Image";

// For Vite, environment variables are accessed via import.meta.env
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function ImageUpload({ eventSlug, onImageUploaded }) {
  const [file, setFile] = useState(null);
  const [imageName, setImageName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    setError("");
    setSuccess("");

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file is an image
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Image file must be less than 5MB");
        return;
      }

      setFile(selectedFile);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);

      // Set default image name from file name (without extension)
      const fileName = selectedFile.name.split(".")[0];
      setImageName(fileName);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image to upload");
      return;
    }

    if (!imageName.trim()) {
      setError("Please provide a name for the image");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", imageName);
      formData.append("eventSlug", eventSlug);

      // Use absolute URL
      const uploadUrl = `${API_BASE_URL}/events/${eventSlug}/images/upload`;

      console.log("Uploading to:", uploadUrl);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          // Let the browser set the content type for FormData
          // This ensures proper boundary setting
        },
        withCredentials: true,
      });

      if (response.data && response.data.success) {
        setSuccess("Image uploaded successfully");
        setFile(null);
        setPreviewUrl("");
        setImageName("");

        console.log("Upload response:", response.data);

        // Notify parent component of the new image
        if (onImageUploaded && response.data.data && response.data.data.image) {
          onImageUploaded(response.data.data.image);
        }
      } else {
        throw new Error(response.data?.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // If no eventSlug, don't show the component
  if (!eventSlug) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload New Image
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <Box
          sx={{
            width: "100%",
            height: 200,
            mb: 2,
            backgroundImage: `url(${previewUrl})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            border: "1px solid #ddd",
            borderRadius: 1,
          }}
        />
      )}

      {/* Upload Form */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* File Input (hidden but accessible) */}
        <input
          accept="image/*"
          type="file"
          id="image-upload-input"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* File Selection Button */}
        <Button
          component="label"
          htmlFor="image-upload-input"
          variant="outlined"
          startIcon={<ImageIcon />}
          sx={{ mb: 2 }}
        >
          {file ? "Change Image" : "Select Image"}
        </Button>

        {/* Image Name Input */}
        <TextField
          label="Image Name"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          disabled={!file || uploading}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Upload Button */}
        <Button
          variant="contained"
          color="primary"
          startIcon={
            uploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <UploadFileIcon />
            )
          }
          disabled={!file || uploading || !imageName.trim()}
          onClick={handleUpload}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
      </Box>
    </Paper>
  );
}

export default ImageUpload;
