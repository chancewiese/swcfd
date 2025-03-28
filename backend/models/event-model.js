// models/event-model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");

const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      set: function (value) {
        // Also set the titleSlug when title is set
        if (value && (!this.titleSlug || this.isModified("title"))) {
          this.titleSlug = slugify(value, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
          });
        }
        return value;
      },
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    location: {
      type: String,
      required: false,
      default: "",
    },
    startDate: {
      type: Date,
      required: false,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: false,
      default: function () {
        // Default to 1 day after startDate
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
      },
    },
    imageGallery: [
      {
        name: {
          type: String,
          required: false,
          default: "Event Image",
        },
        imageUrl: {
          type: String,
          required: false,
          default: "/api/placeholder/800/400",
        },
      },
    ],
    titleSlug: {
      type: String,
      unique: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
