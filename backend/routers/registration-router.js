// backend/routers/registration-router.js
const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registration-controller");
const { protect, authorize } = require("../middleware/auth");

// Public: get count for a section (used to show capacity on registration page)
router.get(
  "/section/:sectionId/count",
  registrationController.getSectionRegistrationCount
);

// Protected routes
router.post("/", protect, registrationController.createRegistration);
router.get("/my", protect, registrationController.getMyRegistrations);
router.get("/:id", protect, registrationController.getRegistration);
router.put("/:id", protect, registrationController.updateRegistration);
router.delete("/:id", protect, registrationController.cancelRegistration);

// Admin routes
router.get(
  "/section/:sectionId",
  protect,
  authorize("admin"),
  registrationController.getRegistrationsBySection
);
router.get(
  "/",
  protect,
  authorize("admin"),
  registrationController.getAllRegistrations
);

module.exports = router;
