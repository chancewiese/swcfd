// src/components/events/EventGallery.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const EventGallery = ({
  eventId,
  images = [],
  onUpload,
  onDelete,
  onReorder,
}) => {
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Please select a valid image file");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("caption", caption);

      await onUpload(formData);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setCaption("");
      setError("");
    } catch (error) {
      setError("Failed to upload image");
    }
  };

  const handleMoveImage = (imageId, direction) => {
    const currentIndex = images.findIndex((img) => img.id === imageId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const swap = direction === "up" ? -1 : 1;
    [newImages[currentIndex], newImages[currentIndex + swap]] = [
      newImages[currentIndex + swap],
      newImages[currentIndex],
    ];

    onReorder(newImages.map((img) => img.id));
  };

  if (!images.length && !user?.isAdmin) {
    return (
      <div className="p-3 text-center">
        <p className="text-secondary">No photos available yet</p>
      </div>
    );
  }

  return (
    <div>
      {user?.isAdmin && (
        <button
          className="btn btn-primary btn-icon upload-button"
          onClick={() => setUploadDialogOpen(true)}
        >
          <span className="material-icons">add</span>
          Add Photo
        </button>
      )}

      <div className="gallery-grid">
        {images.map((image) => (
          <div className="gallery-item" key={image.id}>
            <img
              src={`http://localhost:3000${image.url}`}
              alt={image.caption || "Event photo"}
              className="gallery-image"
            />
            {image.caption && (
              <div className="gallery-caption">{image.caption}</div>
            )}
            {user?.isAdmin && (
              <div className="gallery-actions">
                <button
                  className="gallery-action-button"
                  onClick={() => handleMoveImage(image.id, "up")}
                  disabled={images.indexOf(image) === 0}
                >
                  ↑
                </button>
                <button
                  className="gallery-action-button"
                  onClick={() => handleMoveImage(image.id, "down")}
                  disabled={images.indexOf(image) === images.length - 1}
                >
                  ↓
                </button>
                <button
                  className="gallery-action-button"
                  onClick={() => onDelete(image.id)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {uploadDialogOpen && (
        <div className="modal-backdrop visible">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add New Photo</h3>
              <button
                className="modal-close"
                onClick={() => setUploadDialogOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error mb-3">{error}</div>}
              <div className="my-3">
                <input
                  accept="image/*"
                  type="file"
                  onChange={handleFileSelect}
                  className="form-control mb-3"
                />
                <div className="form-group">
                  <label htmlFor="caption" className="form-label">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    id="caption"
                    className="form-control"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn"
                onClick={() => setUploadDialogOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpload}>
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;
