// src/utils/axiosConfig.js
import axios from "axios";

// Get API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create an axios instance with the API base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  timeout: 10000, // 10 seconds
});

console.log("API Base URL:", API_BASE_URL); // For debugging

export default api;
