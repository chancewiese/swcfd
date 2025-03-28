// src/pages/GalleryPage.jsx
import { useState, useEffect } from "react";
import "./GalleryPage.css";

const GalleryPage = () => {
  const [images, setImages] = useState([]);

  // Create placeholder images
  useEffect(() => {
    const placeholderImages = Array(12)
      .fill(null)
      .map((_, index) => ({
        id: index,
        url: `/api/placeholder/400/300`,
        caption: `Photo ${index + 1}`,
      }));

    setImages(placeholderImages);
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Photo Gallery</h1>

      <div className="paper p-3">
        <div className="gallery-grid">
          {images.map((image) => (
            <div className="gallery-item" key={image.id}>
              <img
                src={image.url}
                alt={image.caption || "Gallery image"}
                className="gallery-image"
              />
              {image.caption && (
                <div className="gallery-caption">{image.caption}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
