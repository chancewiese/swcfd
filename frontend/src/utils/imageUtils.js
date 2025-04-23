// src/utils/imageUtils.js

// Get backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Converts a relative image path to a full URL
 * @param {string} imagePath - Path to the image (typically from the API)
 * @param {string} defaultImage - Default image path to use if imagePath is undefined
 * @returns {string} Complete URL to the image
 */
export const getImageUrl = (
  imagePath,
  defaultImage = "/images/placeholder-event.jpg"
) => {
  if (!imagePath) return `${BACKEND_URL}${defaultImage}`;

  // If it's already a full URL, return it as is
  if (imagePath.startsWith("http")) return imagePath;

  // If it already has the /images prefix, just add the backend URL
  if (imagePath.startsWith("/images")) {
    return `${BACKEND_URL}${imagePath}`;
  }

  // Otherwise, assume it's a filename and add the /images path
  return `${BACKEND_URL}/images/${imagePath}`;
};

/**
 * Handles image loading errors by setting a fallback image
 * @param {Event} event - The error event from the img element
 */
export const handleImageError = (event) => {
  console.error("Image failed to load:", event.target.src);
  event.target.src = `${BACKEND_URL}/images/placeholder-event.jpg`;
};

/**
 * Gets the primary event image URL
 * @param {Object} event - Event object from the API
 * @returns {string} URL to the primary event image
 */
export const getEventPrimaryImage = (event) => {
  if (!event) return `${BACKEND_URL}/images/placeholder-event.jpg`;

  if (
    event.imageGallery &&
    event.imageGallery.length > 0 &&
    event.imageGallery[0].imageUrl
  ) {
    return getImageUrl(event.imageGallery[0].imageUrl);
  }

  return `${BACKEND_URL}/images/placeholder-event.jpg`;
};

/**
 * Generates a consistent image path for a new event image
 * @param {string} eventSlug - The event's slug
 * @param {string} imageName - Original name of the image
 * @returns {string} Consistent image path
 */
export const generateEventImagePath = (eventSlug, imageName) => {
  // Create a safe filename
  const cleanName = imageName.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const timestamp = Date.now();
  return `events_${eventSlug}_${cleanName}_${timestamp}`;
};
