// backend/app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");

// Import routes
const eventRouter = require("./routers/event-router");

// Initialize app
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    });
  })
  .catch((err) => console.log(err));

// Export for testing purposes
module.exports = app;
