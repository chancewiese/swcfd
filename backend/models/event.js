// models/event.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  registrationId: {
    type: String,
    required: true,
    unique: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  registrationDeadline: {
    type: Date,
  },
  maxParticipants: {
    type: Number,
  },
  basePrice: {
    type: Number,
  },
  eventType: {
    type: String,
    enum: ["individual", "team", "family"],
    required: true,
  },
  sections: [
    {
      type: Schema.Types.ObjectId,
      ref: "EventSection",
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

EventSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Event", EventSchema);
