// backend/models/sponsor-model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SponsorSchema = new Schema(
  {
    name: { type: String, required: true },
    tierId: { type: Schema.Types.ObjectId, ref: "SponsorTier", required: true },
    logoUrl: { type: String },
    website: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sponsor", SponsorSchema);
