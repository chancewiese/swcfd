// src/components/ImageSlider.jsx
import { useState, useEffect } from "react";
import { handleImageError } from "../utils/imageUtils";
import "./ImageSlider.css";

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  // Auto-advance images every 5 seconds
  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      goToNextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, images]);

  // Handle slide transitions
  const goToNextSlide = () => {
    if (isTransitioning || !images || images.length <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);

    // Reset transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToPrevSlide = () => {
    if (isTransitioning || !images || images.length <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );

    // Reset transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;

    setIsTransitioning(true);
    setCurrentIndex(index);

    // Reset transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Detect swipe (threshold of 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - go to next slide
        goToNextSlide();
      } else {
        // Swipe right - go to previous slide
        goToPrevSlide();
      }
    }
  };

  // If no images or only one image, render simple image
  if (!images || images.length === 0) {
    return (
      <div className="image-slider-container empty">
        <div className="no-images-message">No images available</div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="image-slider-container single">
        <div className="slider-image-wrapper">
          <img
            src={typeof images[0] === "string" ? images[0] : images[0].url}
            alt={
              typeof images[0] === "object" && images[0].alt
                ? images[0].alt
                : "Event image"
            }
            className="slider-image"
            onError={handleImageError}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="image-slider-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="slider-images">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slider-image-wrapper ${
              index === currentIndex ? "active" : ""
            }`}
            style={{
              transform: `translateX(${100 * (index - currentIndex)}%)`,
            }}
          >
            <img
              src={typeof image === "string" ? image : image.url}
              alt={
                typeof image === "object" && image.alt
                  ? image.alt
                  : `Image ${index + 1}`
              }
              className="slider-image"
              onError={handleImageError}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        className="slider-arrow prev"
        onClick={goToPrevSlide}
        aria-label="Previous image"
      >
        &#10094;
      </button>
      <button
        className="slider-arrow next"
        onClick={goToNextSlide}
        aria-label="Next image"
      >
        &#10095;
      </button>

      {/* Indicator dots */}
      <div className="slider-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            className={`slider-indicator ${
              index === currentIndex ? "active" : ""
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
