// src/components/gallery/PhotoManagerDialog.jsx
import { useState, useEffect } from "react";
import UndoIcon from "@mui/icons-material/Undo";
import { getImageUrl } from "../../utils/imageUtils";
import useSiteSettings from "../../hooks/useSiteSettings";
import "../../components/events/pickleball/PickleballDialog.css";

const PhotoManagerDialog = ({ isOpen, onClose, photos, onPhotosUpdated }) => {
  const { uploadGalleryPhoto, deleteGalleryPhoto } = useSiteSettings();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [markedForDeletion, setMarkedForDeletion] = useState(new Set());

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !saving && !uploading) handleClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, saving, uploading]);

  const handleFileChange = async (e) => {
    setError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 5 MB limit`);
        continue;
      }
      await handleUpload(file);
    }
    e.target.value = "";
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await uploadGalleryPhoto(formData);
      if (response && response.success) onPhotosUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleMarkForDeletion = (photoId) => {
    const next = new Set(markedForDeletion);
    next.has(photoId) ? next.delete(photoId) : next.add(photoId);
    setMarkedForDeletion(next);
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
        Array.from(markedForDeletion).map((id) => deleteGalleryPhoto(id)),
      );
      handleClose();
      onPhotosUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete some photos");
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
        <h2>Manage Gallery Photos</h2>

        {error && <div className="dialog-error">{error}</div>}

        <div className="gallery-upload-section">
          <h3>Upload Photos</h3>
          <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.75rem" }}>
            You can select multiple photos at once.
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading || saving}
            className="gallery-file-input"
            id="gallery-photo-upload"
          />
          <label htmlFor="gallery-photo-upload">
            <button
              type="button"
              className="gallery-upload-button"
              onClick={() => document.getElementById("gallery-photo-upload").click()}
              disabled={uploading || saving}
            >
              {uploading ? "Uploading..." : "Select Photos"}
            </button>
          </label>
        </div>

        {photos && photos.length > 0 ? (
          <>
            <h3>Current Photos ({photos.length})</h3>
            <div className="gallery-grid">
              {photos.map((photo) => {
                const isMarked = markedForDeletion.has(photo._id);
                return (
                  <div
                    key={photo._id}
                    className={`gallery-image-item ${isMarked ? "marked-for-deletion" : ""}`}
                  >
                    <img
                      src={getImageUrl(photo.imageUrl)}
                      alt={photo.name || "Gallery photo"}
                      onError={(e) => {
                        e.target.src = "/images/placeholder-event.jpg";
                      }}
                    />
                    {isMarked ? (
                      <button
                        className="gallery-undo-button"
                        onClick={() => handleMarkForDeletion(photo._id)}
                        disabled={saving}
                        title="Undo"
                        type="button"
                      >
                        <UndoIcon />
                      </button>
                    ) : (
                      <button
                        className="gallery-delete-button"
                        onClick={() => handleMarkForDeletion(photo._id)}
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
                {markedForDeletion.size} photo
                {markedForDeletion.size > 1 ? "s" : ""} marked for deletion.
                Click Save to permanently delete.
              </div>
            )}
          </>
        ) : (
          <div className="gallery-empty-state">
            No photos yet. Upload photos using the button above.
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

export default PhotoManagerDialog;
