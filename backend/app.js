// backend/app.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const colors = require("colors");

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`),
});

// Import route files
const authRoutes = require("./routers/auth-router");
const userRoutes = require("./routers/user-router");
const familyRoutes = require("./routers/family-router");
const eventRoutes = require("./routers/event-router");

// Initialize Express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Enable CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Development logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve static files from the images directory
app.use(
  "/images",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "images"))
);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/families", familyRoutes);
app.use("/api/events", eventRoutes);

// Add a simple test route
app.get("/test", (req, res) => {
  res.send("API is running...");
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// Database connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(colors.cyan.bold("MongoDB connected successfully"));

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(
        colors.yellow.bold(
          `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
        )
      );
      console.log(
        colors.green.bold(`API available at http://localhost:${PORT}`)
      );
    });
  })
  .catch((err) => {
    console.error(colors.red.bold("MongoDB connection error:"), err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(colors.red.bold("Unhandled Promise Rejection:"), err.message);
  // Close server & exit process
  process.exit(1);
});

// Export for testing purposes
module.exports = app;
