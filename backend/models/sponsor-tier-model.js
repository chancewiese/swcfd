// backend/models/sponsor-tier-model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SponsorTierSchema = new Schema(
  {
    name: { type: String, required: true },
    contributionRange: { type: String },
    description: { type: String },
    benefits: [{ type: String }],
    color: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SponsorTier", SponsorTierSchema);
