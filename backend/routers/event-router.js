// routers/event-router.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event-controller");

// Get all events
router.get("/", eventController.getAllEvents);

// Get single event by ID or slug
router.get("/:id", eventController.getEvent);

// Create new event
router.post("/", eventController.createEvent);

// Update event
router.put("/:id", eventController.updateEvent);

// Delete event
router.delete("/:id", eventController.deleteEvent);

// Add section to event
router.post("/:id/sections", eventController.addEventSection);

// Update section
router.put("/:id/sections/:sectionId", eventController.updateEventSection);

// Delete section
router.delete("/:id/sections/:sectionId", eventController.deleteEventSection);

module.exports = router;
