// backend/routers/auth-router.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password/:resettoken", authController.resetPassword);

// Protected routes
router.get("/me", protect, authController.getMe);
router.put("/update-password", protect, authController.updatePassword);
router.get("/logout", protect, authController.logout);

module.exports = router;
