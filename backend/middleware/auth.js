// middleware/auth.js
const User = require("../models/user-model");

exports.authenticate = async (req, res, next) => {
  try {
    // Check if session exists
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find user by ID
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

exports.isAdmin = (req, res, next) => {
  // Check if user is authenticated and is an admin
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin privileges required",
    });
  }

  next();
};
