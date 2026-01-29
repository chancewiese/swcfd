// src/components/events/pickleball/GalleryEditDialog.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./PickleballDialog.css";
import { IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UndoIcon from "@mui/icons-material/Undo";
import { getImageUrl } from "../../../utils/imageUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const GalleryEditDialog = ({
  isOpen,
  onClose,
  eventSlug,
  images,
  onImagesUpdated,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Track which images are marked for deletion (by ID)
  const [markedForDeletion, setMarkedForDeletion] = useState(new Set());

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !saving && !uploading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, saving, uploading]);

  const handleFileChange = (e) => {
    setError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file must be less than 5MB");
        return;
      }

      setUploadFile(file);
      setImageName(file.name.split(".")[0]);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setError("Please select an image to upload");
      return;
    }

    if (!imageName.trim()) {
      setError("Please provide a name for the image");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", uploadFile);
      formData.append("name", imageName);
      formData.append("eventSlug", eventSlug);

      console.log(
        "Uploading image to:",
        `${API_BASE_URL}/events/${eventSlug}/images/upload`,
      );

      const response = await axios.post(
        `${API_BASE_URL}/events/${eventSlug}/images/upload`,
        formData,
        {
          withCredentials: true,
        },
      );

      console.log("Upload response:", response.data);

      if (response.data && response.data.success) {
        // Reset upload state
        setUploadFile(null);
        setUploadPreview("");
        setImageName("");

        // Refresh the gallery immediately
        onImagesUpdated();
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleMarkForDeletion = (imageId) => {
    const newMarked = new Set(markedForDeletion);
    if (newMarked.has(imageId)) {
      // Already marked, unmark it (undo)
      newMarked.delete(imageId);
    } else {
      // Mark for deletion
      newMarked.add(imageId);
    }
    setMarkedForDeletion(newMarked);
  };

  const handleSave = async () => {
    if (markedForDeletion.size === 0) {
      // Nothing to delete, just close
      handleClose();
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Delete all marked images
      const deletePromises = Array.from(markedForDeletion).map((imageId) =>
        axios.delete(`${API_BASE_URL}/events/${eventSlug}/images/${imageId}`, {
          withCredentials: true,
        }),
      );

      await Promise.all(deletePromises);

      // Success - close and refresh
      handleClose();
      onImagesUpdated();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete some images");
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Reset all state
    setUploadFile(null);
    setUploadPreview("");
    setImageName("");
    setError("");
    setMarkedForDeletion(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay" onClick={handleClose}>
      <div
        className="pickleball-dialog-content gallery-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Manage Image Gallery</h2>

        {error && <div className="dialog-error">{error}</div>}

        {/* Upload Section */}
        <div className="gallery-upload-section">
          <h3>Upload New Image</h3>
          <div className="form-group">
            <input
              type="file"
              id="gallery-file-input"
              className="gallery-file-input"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="gallery-file-input">
              <button
                type="button"
                className="gallery-upload-button"
                onClick={() =>
                  document.getElementById("gallery-file-input").click()
                }
                disabled={uploading}
              >
                <CloudUploadIcon />
                Choose Image
              </button>
            </label>
          </div>

          {uploadPreview && (
            <>
              <div className="gallery-preview">
                <img src={uploadPreview} alt="Preview" />
              </div>
              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label htmlFor="image-name">Image Name</label>
                <input
                  type="text"
                  id="image-name"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  disabled={uploading}
                  placeholder="Enter image name"
                />
              </div>
              <button
                type="button"
                className="submit-btn"
                onClick={handleUpload}
                disabled={uploading}
                style={{ marginTop: "0.5rem" }}
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </>
          )}
        </div>

        {/* Gallery Grid */}
        {images && images.length > 0 ? (
          <>
            <div className="gallery-grid">
              {images.map((image) => {
                const isMarked = markedForDeletion.has(image._id);
                return (
                  <div
                    key={image._id}
                    className={`gallery-image-item ${isMarked ? "marked-for-deletion" : ""}`}
                  >
                    <img
                      src={getImageUrl(image.imageUrl)}
                      alt={image.name}
                      onError={(e) => {
                        e.target.src = "/images/placeholder-event.jpg";
                      }}
                    />
                    {isMarked ? (
                      <button
                        className="gallery-undo-button"
                        onClick={() => handleMarkForDeletion(image._id)}
                        disabled={saving}
                        title="Undo deletion"
                        type="button"
                      >
                        <UndoIcon />
                      </button>
                    ) : (
                      <button
                        className="gallery-delete-button"
                        onClick={() => handleMarkForDeletion(image._id)}
                        disabled={saving}
                        title="Mark for deletion"
                        type="button"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {markedForDeletion.size > 0 && (
              <div className="deletion-notice">
                {markedForDeletion.size} image
                {markedForDeletion.size > 1 ? "s" : ""} marked for deletion.
                Click Save to permanently delete.
              </div>
            )}
          </>
        ) : (
          <div className="gallery-empty-state">
            No images in gallery. Upload images using the form above.
          </div>
        )}

        {/* Dialog Actions */}
        <div className="dialog-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleClose}
            disabled={uploading || saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="submit-btn"
            onClick={handleSave}
            disabled={uploading || saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryEditDialog;
