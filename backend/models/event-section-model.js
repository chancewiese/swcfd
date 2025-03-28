// models/event-section-model.js
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
          this.slug = slugify(value, { lower: true, trim: true });
        }
        return value;
      },
    },
    description: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      default: null,
    },
    registrationOpenDate: {
      type: Date,
      default: null,
    },
    slug: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventSection", EventSectionSchema);
