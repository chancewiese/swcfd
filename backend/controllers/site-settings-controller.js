// backend/controllers/site-settings-controller.js
const SiteSettings = require("../models/site-settings-model");
const fs = require("fs");
const path = require("path");

// Helper: get or create a keyed settings document
// For 'hero': if no keyed document exists, migrate legacy keyless document
const getOrCreateByKey = async (key) => {
  // Try to find by key first
  let settings = await SiteSettings.findOne({ key });
  if (settings) return settings;

  if (key === "hero") {
    // Look for legacy keyless document and migrate it
    const legacy = await SiteSettings.findOne({ key: { $exists: false } });
    if (legacy) {
      legacy.key = "hero";
      await legacy.save();
      return legacy;
    }
    // No legacy doc, create fresh
    settings = new SiteSettings({ key: "hero", heroImages: [] });
    await settings.save();
    return settings;
  }

  // For 'about' and 'contact', create fresh
  settings = new SiteSettings({ key });
  await settings.save();
  return settings;
};

// GET /api/site/hero-images
exports.getHeroImages = async (req, res) => {
  try {
    const settings = await getOrCreateByKey("hero");
    res.status(200).json({ success: true, data: settings.heroImages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/site/hero-images/upload
exports.uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    const settings = await getOrCreateByKey("hero");

    const randomNum = Math.floor(Math.random() * 1000000);
    const imageName = req.body.name || `hero-${randomNum}`;
    const imagePath = `/images/homepage/${req.file.filename}`;

    settings.heroImages.push({ name: imageName, imageUrl: imagePath });
    await settings.save();

    const addedImage = settings.heroImages[settings.heroImages.length - 1];
    res.status(201).json({ success: true, data: addedImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/site/hero-images/:imageId
exports.deleteHeroImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const settings = await getOrCreateByKey("hero");

    const imageIndex = settings.heroImages.findIndex(
      (img) => img._id.toString() === imageId,
    );

    if (imageIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    const imagePath = settings.heroImages[imageIndex].imageUrl;

    // Try to delete the file from disk
    if (imagePath) {
      try {
        const filename = path.basename(imagePath);
        const absolutePath = path.join(__dirname, "../images/homepage", filename);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      } catch (fileErr) {
        console.error("Error deleting file:", fileErr);
      }
    }

    settings.heroImages.splice(imageIndex, 1);
    await settings.save();

    res.status(200).json({ success: true, message: "Image deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── About page ────────────────────────────────────────────────────────────────

// GET /api/site/about
// Returns only about content from the 'about' document
exports.getAbout = async (req, res) => {
  try {
    const settings = await getOrCreateByKey("about");
    res.status(200).json({
      success: true,
      data: settings.about || { content: "" },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/site/about
exports.updateAbout = async (req, res) => {
  try {
    const settings = await getOrCreateByKey("about");
    settings.about = { content: req.body.content || "" };
    await settings.save();
    res.status(200).json({ success: true, data: settings.about });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Contact / Organizers ──────────────────────────────────────────────────────

// GET /api/site/contact
// Returns organizers from the 'contact' document
exports.getContact = async (req, res) => {
  try {
    const settings = await getOrCreateByKey("contact");
    res.status(200).json({
      success: true,
      data: settings.organizers || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/site/organizers
exports.addOrganizer = async (req, res) => {
  try {
    const settings = await getOrCreateByKey("contact");
    const { name, role, phone, email } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    settings.organizers.push({
      name: name.trim(),
      role: role || "",
      phone: phone || "",
      email: email || "",
      order: settings.organizers.length,
    });
    await settings.save();
    const added = settings.organizers[settings.organizers.length - 1];
    res.status(201).json({ success: true, data: added });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/site/organizers/:organizerId
exports.updateOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const settings = await getOrCreateByKey("contact");
    const organizer = settings.organizers.id(organizerId);
    if (!organizer) {
      return res.status(404).json({ success: false, message: "Organizer not found" });
    }
    const { name, role, phone, email } = req.body;
    if (name !== undefined) organizer.name = name.trim();
    if (role !== undefined) organizer.role = role;
    if (phone !== undefined) organizer.phone = phone;
    if (email !== undefined) organizer.email = email;
    await settings.save();
    res.status(200).json({ success: true, data: organizer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/site/organizers/:organizerId
exports.deleteOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const settings = await getOrCreateByKey("contact");
    const index = settings.organizers.findIndex(
      (o) => o._id.toString() === organizerId,
    );
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Organizer not found" });
    }
    settings.organizers.splice(index, 1);
    await settings.save();
    res.status(200).json({ success: true, message: "Organizer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
