// backend/models/family-member-model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FamilyMemberSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
    },
    // If this family member has a user account
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // The family this member belongs to
    family: {
      type: Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Family reference is required"],
    },
  },
  { timestamps: true }
);

// Virtual for full name
FamilyMemberSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
FamilyMemberSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Check if family member has a user account
FamilyMemberSchema.virtual("hasUserAccount").get(function () {
  return !!this.user;
});

// Create model from schema
const FamilyMember = mongoose.model("FamilyMember", FamilyMemberSchema);

module.exports = FamilyMember;
