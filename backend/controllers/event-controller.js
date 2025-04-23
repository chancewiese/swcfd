// backend/controllers/event-controller.js
const mongoose = require("mongoose");
const Event = require("../models/event-model");
const EventSection = require("../models/event-section-model");
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");

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

// Get single event by slug
exports.getEventBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const event = await Event.findOne({ titleSlug: slug }).populate("sections");

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

// Update event by slug
exports.updateEventBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    console.log("Updating event:", slug);
    console.log("Request body includes imageGallery:", !!req.body.imageGallery);

    // Log image gallery for debugging
    if (req.body.imageGallery) {
      console.log(
        "Image gallery in update request:",
        req.body.imageGallery.length,
        "images"
      );
    }

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

// Delete event by slug
exports.deleteEventBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    const event = await Event.findOne({ titleSlug: slug });

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

    // Delete associated images if any
    if (event.imageGallery && event.imageGallery.length > 0) {
      for (const image of event.imageGallery) {
        try {
          if (image.imageUrl) {
            const filename = path.basename(image.imageUrl);
            const imagePath = path.join(__dirname, "../images", filename);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
              console.log(`Deleted image file: ${filename}`);
            }
          }
        } catch (error) {
          console.error(`Failed to delete image file: ${error.message}`);
        }
      }
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

// Upload an image for an event
exports.uploadEventImage = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    // Log the request for debugging
    console.log("Upload request received for event:", slug);
    console.log("File received:", req.file ? req.file.filename : "No file");

    // Verify file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Find the event by slug
    const event = await Event.findOne({ titleSlug: slug });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Create image info object
    const imageName = req.body.name || "Event Image";

    // IMPORTANT: Store only the path relative to the images directory
    // This makes the paths consistent and portable
    const imagePath = `/images/${req.file.filename}`;

    console.log("Creating image entry with path:", imagePath);

    // Add image to event's gallery
    const imageEntry = {
      name: imageName,
      imageUrl: imagePath,
    };

    if (!event.imageGallery) {
      event.imageGallery = [];
    }

    event.imageGallery.push(imageEntry);
    await event.save();

    console.log(
      "Image added to event, new gallery size:",
      event.imageGallery.length
    );

    // Return the created image with its MongoDB _id for future reference
    const addedImage = event.imageGallery[event.imageGallery.length - 1];

    res.status(201).json({
      success: true,
      data: {
        image: addedImage,
        message: "Image uploaded successfully",
      },
    });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get all images for an event
exports.getEventImages = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    console.log("Getting images for event:", slug);

    // Find the event by slug
    const event = await Event.findOne({ titleSlug: slug });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    console.log(
      "Found event, image gallery size:",
      event.imageGallery ? event.imageGallery.length : 0
    );

    res.status(200).json({
      success: true,
      data: event.imageGallery || [],
    });
  } catch (err) {
    console.error("Error getting images:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete an image
exports.deleteEventImage = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const imageId = req.params.imageId;

    console.log("Delete request for image:", imageId, "in event:", slug);

    // Find the event by slug
    const event = await Event.findOne({ titleSlug: slug });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Find the image in the gallery
    if (!event.imageGallery || event.imageGallery.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event has no images",
      });
    }

    // Find the image with the specific ID
    const imageIndex = event.imageGallery.findIndex(
      (img) => img._id.toString() === imageId
    );

    console.log("Image index:", imageIndex);

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Get the image path before removing from array
    const imagePath = event.imageGallery[imageIndex].imageUrl;

    // Try to delete the file from disk if it exists
    if (imagePath) {
      try {
        // Extract filename from the path
        const filename = path.basename(imagePath);
        const absolutePath = path.join(__dirname, "../images", filename);

        console.log("Attempting to delete file:", absolutePath);

        // Check if file exists and delete it
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log("File deleted from disk");
        } else {
          console.log("File does not exist on disk");
        }
      } catch (fileErr) {
        // Just log the error but continue with database update
        console.error("Error deleting file from disk:", fileErr);
      }
    }

    // Remove image from the gallery array
    event.imageGallery.splice(imageIndex, 1);
    await event.save();

    console.log(
      "Image removed from event, new gallery size:",
      event.imageGallery.length
    );

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Add section to event
exports.addEventSection = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    // First find the event to make sure it exists
    const event = await Event.findOne({ titleSlug: slug });
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
    const slug = req.params.slug;
    const sectionId = req.params.sectionId;

    // Get event by slug
    const event = await Event.findOne({ titleSlug: slug });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Remove section from event
    await Event.findByIdAndUpdate(event._id, {
      $pull: { sections: sectionId },
    });

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
