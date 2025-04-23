// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

// Protect routes - requires authentication
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(" ")[1];
  }
  // Check if token exists in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. Please log in.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Add user to request object
    req.user = {
      id: user._id,
      roles: user.roles,
      family: user.family,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please log in again.",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        success: false,
        message: "User has no roles assigned",
      });
    }

    // Check if user has at least one of the required roles
    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. User doesn't have the required permissions.`,
      });
    }

    next();
  };
};

// Check if user is family manager
exports.isFamilyManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.roles.includes("familyManager")) {
      return res.status(403).json({
        success: false,
        message: "User must be a family manager to access this route",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Middleware to check if user belongs to the family
exports.belongsToFamily = async (req, res, next) => {
  try {
    const familyId = req.params.familyId || req.body.familyId;

    if (!familyId) {
      return res.status(400).json({
        success: false,
        message: "Family ID is required",
      });
    }

    // Check if user is admin (admins can access any family)
    if (req.user.roles.includes("admin")) {
      return next();
    }

    // Check if user's family matches the requested family
    if (req.user.family && req.user.family.toString() === familyId.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "User doesn't belong to this family",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
