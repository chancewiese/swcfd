// models/eventsection.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSectionSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  maxParticipants: {
    type: Number,
  },
  price: {
    type: Number,
  },
  ageRestrictions: {
    minAge: Number,
    maxAge: Number,
  },
  registrations: [
    {
      type: Schema.Types.ObjectId,
      ref: "Registration",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

EventSectionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("EventSection", EventSectionSchema);
