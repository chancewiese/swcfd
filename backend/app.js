// backend/app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const mongoose = require("mongoose");

// Import routes
const eventRouter = require("./routers/event-router");

// Initialize app
const app = express();

// CORS configuration - making sure images can be loaded from the frontend
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Adjust port if needed
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Make sure the images directory exists
const imagesDir = path.join(__dirname, "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`Created images directory at: ${imagesDir}`);
}

// Serve static files from the images directory
// Need to ensure CORS headers are sent with image responses
app.use(
  "/images",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "images"))
);

// Add a test endpoint to check the images directory
app.get("/check-images", (req, res) => {
  const imagesDir = path.join(__dirname, "images");
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      directory: imagesDir,
      files: files,
      exists: fs.existsSync(imagesDir),
    });
  });
});

// Add a test endpoint to check if server is working
app.get("/test-image", (req, res) => {
  res.send("Image server is working");
});

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mount routes
app.use("/api/events", eventRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "404 - Not Found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Start server
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Images served from: ${path.join(__dirname, "images")}`);
      console.log(`CORS enabled for origin: ${corsOptions.origin}`);
    });
  })
  .catch((err) => console.log(err));

// Export for testing purposes
module.exports = app;
