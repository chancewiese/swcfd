// backend/controllers/event-controller.js
const mongoose = require("mongoose");
const Event = require("../models/event-model");
const EventSection = require("../models/event-section-model");
const slugify = require("slugify");

// Get all events
exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({
      startDate: 1,
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get single event by ID or slug
exports.getEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    // Check if ID is a MongoDB ObjectId or a slug
    let event;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      event = await Event.findById(eventId).populate("sections");
    } else {
      event = await Event.findOne({ titleSlug: eventId }).populate("sections");
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Create new event
exports.createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
    };

    // Ensure titleSlug is set
    if (eventData.title) {
      eventData.titleSlug = slugify(eventData.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
    }

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update event
exports.updateEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    // Ensure titleSlug is updated if title changes
    if (req.body.title) {
      req.body.titleSlug = slugify(req.body.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
    }

    const event = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update event by slug
exports.updateEventBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    // Ensure titleSlug is updated if title changes
    if (req.body.title) {
      req.body.titleSlug = slugify(req.body.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
    }

    const event = await Event.findOneAndUpdate({ titleSlug: slug }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Delete associated sections
    if (event.sections && event.sections.length > 0) {
      await EventSection.deleteMany({
        _id: { $in: event.sections },
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Add section to event
exports.addEventSection = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    // First find the event to make sure it exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ensure section data has slug
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, trim: true });
    }

    // Create the section
    const section = new EventSection(req.body);
    await section.save();

    // Add section to event's sections array
    event.sections.push(section._id);
    await event.save();

    res.status(201).json({
      success: true,
      data: section,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update event section
exports.updateEventSection = async (req, res, next) => {
  try {
    const sectionId = req.params.sectionId;

    // Explicitly set slug if title is changed
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, trim: true });
    }

    const section = await EventSection.findByIdAndUpdate(sectionId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete event section
exports.deleteEventSection = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const sectionId = req.params.sectionId;

    // Remove section from event
    await Event.findByIdAndUpdate(eventId, { $pull: { sections: sectionId } });

    // Delete the section
    const section = await EventSection.findByIdAndDelete(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
