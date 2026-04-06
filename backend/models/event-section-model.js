// backend/models/event-section-model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");

const EventSectionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      set: function (value) {
        // Also set the slug when title is set
        if (value && (!this.slug || this.isModified("title"))) {
          // Remove quotation marks and other problematic characters from slug
          this.slug = slugify(value, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g, // Removes quotes and other special chars
          });
        }
        return value;
      },
    },
    description: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      default: null,
    },
    maxTeams: {
      type: Number,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    registrationOpenDate: {
      type: Date,
      default: null,
    },
    tournamentDate: {
      type: Date,
      default: null,
    },
    tournamentTime: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("EventSection", EventSectionSchema);
