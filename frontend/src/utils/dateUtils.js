// frontend/src/utils/dateUtils.js

/**
 * Formats a date string to local date display without timezone issues
 * This prevents the "off by one day" bug when displaying dates from the database
 *
 * @param {string} dateString - ISO date string from the database
 * @returns {string} Formatted date string (e.g., "1/15/2024")
 */
export const formatDateLocal = (dateString) => {
  if (!dateString) return "";

  // Parse the date string and create a date object
  const date = new Date(dateString);

  // Extract year, month, and day in UTC to avoid timezone shifts
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Create a new date using local timezone with the UTC values
  const localDate = new Date(year, month, day);

  // Format using toLocaleDateString
  return localDate.toLocaleDateString();
};

/**
 * Formats a date for use in date input fields (YYYY-MM-DD)
 *
 * @param {string} dateString - ISO date string from the database
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
