// routers/event-router.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event-controller");
const upload = require("../middleware/upload");

// Get all events
router.get("/", eventController.getAllEvents);

// Get single event by slug
router.get("/:slug", eventController.getEventBySlug);

// Create new event
router.post("/", eventController.createEvent);

// Update event by slug
router.put("/:slug", eventController.updateEventBySlug);

// Delete event by slug
router.delete("/:slug", eventController.deleteEventBySlug);

// Upload image for an event
router.post(
  "/:slug/images/upload",
  upload.single("image"),
  eventController.uploadEventImage
);

// Get all images for an event
router.get("/:slug/images", eventController.getEventImages);

// Delete an image
router.delete("/:slug/images/:imageId", eventController.deleteEventImage);

// Add section to event
router.post("/:slug/sections", eventController.addEventSection);

// Update section
router.put("/:slug/sections/:sectionId", eventController.updateEventSection);

// Delete section
router.delete("/:slug/sections/:sectionId", eventController.deleteEventSection);

module.exports = router;
