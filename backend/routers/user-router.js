// backend/routers/user-router.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const { protect, authorize } = require("../middleware/auth");

// User profile routes
router.put("/profile", protect, userController.updateProfile);

// Admin routes
router.get("/", protect, authorize("admin"), userController.getUsers);
router.get("/:id", protect, authorize("admin"), userController.getUserById);
router.put(
  "/:id/roles",
  protect,
  authorize("admin"),
  userController.updateUserRoles
);
router.delete("/:id", protect, authorize("admin"), userController.deleteUser);

module.exports = router;
