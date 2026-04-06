// backend/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define storage destinations
const imagesDir = path.join(__dirname, "../images");
const eventsDir = path.join(imagesDir, "events");
const pickleballDir = path.join(eventsDir, "pickleball");
const homepageDir = path.join(imagesDir, "homepage");

// Create directories if they don't exist
[imagesDir, eventsDir, pickleballDir, homepageDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory at: ${dir}`);
  }
});

// Configure diskStorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get event slug from params or request body
    const eventSlug = req.params.slug || req.body.eventSlug;

    // Determine destination based on event slug
    let destination = imagesDir;

    if (eventSlug === "pickleball-tournament") {
      destination = pickleballDir;
    } else if (eventSlug === "homepage") {
      destination = homepageDir;
    } else if (eventSlug) {
      // For other events, create a directory under events/
      const eventDir = path.join(eventsDir, eventSlug);
      if (!fs.existsSync(eventDir)) {
        fs.mkdirSync(eventDir, { recursive: true });
        console.log(`Created directory at: ${eventDir}`);
      }
      destination = eventDir;
    }

    cb(null, destination);
  },
  filename: function (req, file, cb) {
    // Get event slug from params or request body
    const eventSlug = req.params.slug || req.body.eventSlug;

    // Get file extension
    const ext = path.extname(file.originalname);

    // Create a filename with pattern based on event
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);

    let filename;
    if (eventSlug === "pickleball-tournament") {
      // For pickleball: pickleball-{random}.ext
      filename = `pickleball-${randomNum}${ext}`;
    } else {
      // For other events: eventslug-{random}.ext
      filename = `${eventSlug}-${randomNum}${ext}`;
    }

    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
