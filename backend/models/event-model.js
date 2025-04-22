// backend/models/event-model.js
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
      default: null, // Changed from Date.now to null
    },
    endDate: {
      type: Date,
      required: false,
      default: null, // Changed from function to null
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
          default:
            "/api/images/placeholder_south-weber-central-park-playground.jpg",
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
    sections: [
      {
        type: Schema.Types.ObjectId,
        ref: "EventSection",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
