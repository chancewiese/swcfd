// backend/routers/sponsor-router.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sponsorController = require("../controllers/sponsor-controller");

// Ensure sponsors image directory exists
const sponsorsDir = path.join(__dirname, "../images/sponsors");
if (!fs.existsSync(sponsorsDir)) {
  fs.mkdirSync(sponsorsDir, { recursive: true });
  console.log(`Created directory at: ${sponsorsDir}`);
}

// Dedicated multer config for sponsor logos
const sponsorStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, sponsorsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    cb(null, `sponsor-${timestamp}-${randomNum}${ext}`);
  },
});

const sponsorUpload = multer({
  storage: sponsorStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Tier routes
router.get("/tiers", sponsorController.getAllTiers);
router.post("/tiers", sponsorController.createTier);
router.put("/tiers/:tierId", sponsorController.updateTier);
router.delete("/tiers/:tierId", sponsorController.deleteTier);

// Sponsor entry routes
router.post("/tiers/:tierId/entries", sponsorController.addSponsor);
router.put("/entries/:sponsorId", sponsorController.updateSponsor);
router.delete("/entries/:sponsorId", sponsorController.deleteSponsor);
router.post(
  "/entries/:sponsorId/logo",
  sponsorUpload.single("logo"),
  sponsorController.uploadSponsorLogo,
);

module.exports = router;
