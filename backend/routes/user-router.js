// routes/user-router.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const { authenticate } = require("../middleware/auth");

// Register a new user
router.post("/register", userController.register);

// Login user
router.post("/login", userController.login);

// Logout user
router.post("/logout", userController.logout);

// Get current user (protected route)
router.get("/me", authenticate, userController.getCurrentUser);

// Update user profile (protected route)
router.put("/profile", authenticate, userController.updateProfile);

module.exports = router;
