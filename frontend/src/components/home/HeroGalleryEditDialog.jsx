// src/components/home/HeroGalleryEditDialog.jsx
import { useState, useEffect } from "react";
import UndoIcon from "@mui/icons-material/Undo";
import { getImageUrl } from "../../utils/imageUtils";
import useSiteSettings from "../../hooks/useSiteSettings";
import "../../components/events/pickleball/PickleballDialog.css";

const HeroGalleryEditDialog = ({ isOpen, onClose, images, onImagesUpdated }) => {
  const { uploadHeroImage, deleteHeroImage } = useSiteSettings();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [markedForDeletion, setMarkedForDeletion] = useState(new Set());

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

  const handleFileChange = async (e) => {
    setError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file must be less than 5MB");
        return;
      }

      await handleUpload(file);
      e.target.value = "";
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await uploadHeroImage(formData);
      if (response && response.success) {
        onImagesUpdated();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleMarkForDeletion = (imageId) => {
    const newMarked = new Set(markedForDeletion);
    if (newMarked.has(imageId)) {
      newMarked.delete(imageId);
    } else {
      newMarked.add(imageId);
    }
    setMarkedForDeletion(newMarked);
  };

  const handleSave = async () => {
    if (markedForDeletion.size === 0) {
      handleClose();
      return;
    }

    setSaving(true);
    setError("");
    try {
      await Promise.all(
        Array.from(markedForDeletion).map((imageId) => deleteHeroImage(imageId)),
      );
      handleClose();
      onImagesUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete some images");
      setSaving(false);
    }
  };

  const handleClose = () => {
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
        <h2>Manage Hero Slider Images</h2>

        {error && <div className="dialog-error">{error}</div>}

        <div className="gallery-upload-section">
          <h3>Upload New Image</h3>
          <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.75rem" }}>
            Images display best at a wide aspect ratio (e.g. 1920×800 or 16:5).
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading || saving}
            className="gallery-file-input"
            id="hero-file-upload"
          />
          <label htmlFor="hero-file-upload">
            <button
              type="button"
              className="gallery-upload-button"
              onClick={() => document.getElementById("hero-file-upload").click()}
              disabled={uploading || saving}
            >
              {uploading ? "Uploading..." : "Select Image"}
            </button>
          </label>
        </div>

        {images && images.length > 0 ? (
          <>
            <h3>Current Images</h3>
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
            No images yet. Upload images using the button above.
          </div>
        )}

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

export default HeroGalleryEditDialog;
