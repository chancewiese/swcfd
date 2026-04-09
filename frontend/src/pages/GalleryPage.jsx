// src/pages/GalleryPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useDevMode } from "../context/DevModeContext";
import useSiteSettings from "../hooks/useSiteSettings";
import PhotoManagerDialog from "../components/gallery/PhotoManagerDialog";
import { getImageUrl } from "../utils/imageUtils";
import "./styles/GalleryPage.css";

function GalleryPage() {
  const { hasRole } = useAuth();
  const { devMode } = useDevMode();
  const { getGalleryPhotos } = useSiteSettings();

  const isAdmin = hasRole("admin") && devMode;
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const response = await getGalleryPhotos();
    if (response && response.data) {
      setPhotos(response.data);
    }
    setLoading(false);
  }, [getGalleryPhotos]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, photos.length]);

  const handlePhotosUpdated = async () => {
    await fetchPhotos();
  };

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const lightboxNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i + 1) % photos.length);
  };
  const lightboxPrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);
  };

  return (
    <div className="gallery-page-container">
      <div className="gallery-page-header">
        <div>
          <h1>Photo Gallery</h1>
          <p>Memories from Country Fair Days events</p>
        </div>
        {isAdmin && (
          <button
            className="gallery-manage-btn"
            onClick={() => setIsManagerOpen(true)}
            type="button"
          >
            {photos.length > 0 ? "Manage Photos" : "Add Photos"}
          </button>
        )}
      </div>

      {loading && <div className="gallery-loading">Loading gallery...</div>}

      {!loading && photos.length === 0 && (
        <div className="gallery-empty">
          {isAdmin ? (
            <p>
              No photos yet.{" "}
              <button
                className="inline-link-btn"
                onClick={() => setIsManagerOpen(true)}
                type="button"
              >
                Add some photos
              </button>{" "}
              to get started.
            </p>
          ) : (
            <p>Photos will be added soon. Check back later!</p>
          )}
        </div>
      )}

      {!loading && photos.length > 0 && (
        <div className="gallery-grid">
          {photos.map((photo, index) => (
            <button
              key={photo._id}
              className="gallery-item"
              onClick={() => openLightbox(index)}
              type="button"
              aria-label={`View photo ${index + 1}`}
            >
              <img
                src={getImageUrl(photo.imageUrl)}
                alt={photo.name || `Gallery photo ${index + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/images/placeholder-event.jpg";
                }}
              />
              <div className="gallery-item-overlay">
                <span className="gallery-item-zoom">&#x2922;</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            type="button"
            aria-label="Close"
          >
            ×
          </button>

          {photos.length > 1 && (
            <button
              className="lightbox-nav lightbox-prev"
              onClick={lightboxPrev}
              type="button"
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImageUrl(photos[lightboxIndex].imageUrl)}
              alt={photos[lightboxIndex].name || `Photo ${lightboxIndex + 1}`}
              className="lightbox-image"
              onError={(e) => {
                e.target.src = "/images/placeholder-event.jpg";
              }}
            />
            <div className="lightbox-counter">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </div>

          {photos.length > 1 && (
            <button
              className="lightbox-nav lightbox-next"
              onClick={lightboxNext}
              type="button"
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>
      )}

      <PhotoManagerDialog
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        photos={photos}
        onPhotosUpdated={handlePhotosUpdated}
      />
    </div>
  );
}

export default GalleryPage;
