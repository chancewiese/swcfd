// src/pages/GalleryPage.jsx
const GalleryPage = () => {
  // Placeholder images - in a real app, these would come from an API
  const images = Array(6).fill("/api/placeholder/400/300");

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Photo Gallery</h1>

      <div className="gallery-grid">
        {images.map((image, index) => (
          <div className="gallery-item" key={index}>
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="gallery-image"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
