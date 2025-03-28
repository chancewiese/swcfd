// backend/app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import DB connection
const { connectDB } = require("./db");

// Import routes (these would be your route files)
const eventRoutes = require("./routes/events");
const adminRoutes = require("./routes/admin");
const registrationRoutes = require("./routes/registrations");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      if (req.method === "DELETE") {
        return false;
      }
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
});

// Mount routes
app.use("/admin", adminRoutes);
app.use("/events", eventRoutes);
app.use("/registrations", registrationRoutes);

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

// Only start the server if this file is run directly
if (require.main === module) {
  // Connect to database then start server
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

// Export for testing purposes
module.exports = app;
