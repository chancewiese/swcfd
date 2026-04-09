// backend/models/registration-model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for registrants who can be from the system or external
const RegistrantSchema = new Schema({
  registrantType: {
    type: String,
    enum: ["user", "familyMember", "external"],
    required: true,
  },
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
    // The event section/division being registered for
    eventSection: {
      type: Schema.Types.ObjectId,
      ref: "EventSection",
      required: [true, "Event section is required"],
    },
    // The user who submitted the registration
    registeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Registrant user is required"],
    },
    // The family this registration belongs to
    family: {
      type: Schema.Types.ObjectId,
      ref: "Family",
    },
    // Registration type
    registrationType: {
      type: String,
      enum: ["individual", "family", "team"],
      default: "team",
      required: [true, "Registration type is required"],
    },
    // For family registrations
    familyMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "FamilyMember",
      },
    ],
    // Team info
    teamName: {
      type: String,
      trim: true,
    },
    // Team members (can be users, family members, or external)
    teamMembers: [RegistrantSchema],
    // Registration status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    // Payment status
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    // Contact info for this registration
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    // Admin notes
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Virtual for team size
RegistrationSchema.virtual("teamSize").get(function () {
  if (!this.teamMembers) return 0;
  return this.teamMembers.length;
});

const Registration = mongoose.model("Registration", RegistrationSchema);

module.exports = Registration;
