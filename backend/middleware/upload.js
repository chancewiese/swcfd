// backend/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

// Define storage destination
const imagesDir = path.join(__dirname, "../images");

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`Created images directory at: ${imagesDir}`);
}

// Configure diskStorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store all images in the main images directory
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    // Get event slug from params or request body
    const eventSlug = req.params.slug || req.body.eventSlug;

    // Create a slugified version of the original filename (without extension)
    let originalName = path.parse(file.originalname).name;
    originalName = slugify(originalName, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    // Get file extension
    const ext = path.extname(file.originalname);

    // Create a filename with pattern: events_eventslug_imagename_timestamp.ext
    const timestamp = Date.now();
    const filename = `events_${eventSlug}_${originalName}_${timestamp}${ext}`;

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
