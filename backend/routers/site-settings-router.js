// backend/routers/site-settings-router.js
const express = require("express");
const router = express.Router();
const siteSettingsController = require("../controllers/site-settings-controller");
const upload = require("../middleware/upload");

// GET hero images
router.get("/hero-images", siteSettingsController.getHeroImages);

// Upload a hero image — inject slug so multer routes it to the homepage dir
router.post(
  "/hero-images/upload",
  (req, res, next) => {
    req.params.slug = "homepage";
    next();
  },
  upload.single("image"),
  siteSettingsController.uploadHeroImage,
);

// Delete a hero image
router.delete("/hero-images/:imageId", siteSettingsController.deleteHeroImage);

// About page content
router.get("/about", siteSettingsController.getAbout);
router.put("/about", siteSettingsController.updateAbout);

// Contact page (organizers)
router.get("/contact", siteSettingsController.getContact);

// Organizers
router.post("/organizers", siteSettingsController.addOrganizer);
router.put("/organizers/:organizerId", siteSettingsController.updateOrganizer);
router.delete("/organizers/:organizerId", siteSettingsController.deleteOrganizer);

module.exports = router;
