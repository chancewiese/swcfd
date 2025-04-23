// backend/models/registration-model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for registrants who can be from the system or external
const RegistrantSchema = new Schema({
  // If the registrant is a reference to an existing entity
  registrantType: {
    type: String,
    enum: ["user", "familyMember", "external"],
    required: true,
  },
  // Reference to either a User or FamilyMember
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  familyMember: {
    type: Schema.Types.ObjectId,
    ref: "FamilyMember",
  },
  // For external registrants (not in the system)
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer not to say"],
  },
  dateOfBirth: {
    type: Date,
  },
});

const RegistrationSchema = new Schema(
  {
    // The event being registered for
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required"],
    },
    // The event section being registered for
    eventSection: {
      type: Schema.Types.ObjectId,
      ref: "EventSection",
      required: [true, "Event section is required"],
    },
    // Registration type will be auto-assigned based on form
    registrationType: {
      type: String,
      enum: ["individual", "family", "team"],
      required: [true, "Registration type is required"],
    },
    // For individual or family registrations
    familyMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "FamilyMember",
      },
    ],
    // For team registrations
    teamName: {
      type: String,
      trim: true,
    },
    // Team members can be users, family members, or external people
    teamMembers: [RegistrantSchema],
    // Registration status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Virtual for total team members
RegistrationSchema.virtual("teamSize").get(function () {
  if (this.registrationType !== "team" || !this.teamMembers) return 0;
  return this.teamMembers.length;
});

// Virtual for total family members
RegistrationSchema.virtual("familySize").get(function () {
  if (!this.familyMembers) return 0;
  return this.familyMembers.length;
});

// Create model from schema
const Registration = mongoose.model("Registration", RegistrationSchema);

module.exports = Registration;
