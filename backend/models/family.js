// models/family.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FamilySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  mainContact: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Family", FamilySchema);
