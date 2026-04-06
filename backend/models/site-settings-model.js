// backend/models/site-settings-model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Keyed documents — one document per key: 'hero', 'about', 'contact'
const SiteSettingsSchema = new Schema(
  {
    key: {
      type: String,
      unique: true,
      sparse: true,
    },
    heroImages: [
      {
        name: { type: String, default: "" },
        imageUrl: { type: String, required: true },
      },
    ],
    about: {
      content: {
        type: String,
        default: "",
      },
    },
    organizers: [
      {
        name: { type: String, required: true },
        role: { type: String, default: "" },
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema);
