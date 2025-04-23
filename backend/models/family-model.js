// backend/models/family-model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");

const FamilySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Family name is required"],
      trim: true,
      set: function (value) {
        // Also set the slug when name is set
        if (value && (!this.slug || this.isModified("name"))) {
          this.slug = slugify(value, { lower: true, trim: true });
        }
        return value;
      },
    },
    slug: {
      type: String,
      unique: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Family manager is required"],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "FamilyMember",
      },
    ],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Additional family information
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    phoneNumber: String,
    notes: String,
  },
  { timestamps: true }
);

// Generate a unique slug
FamilySchema.pre("validate", async function (next) {
  if (!this.isModified("name")) return next();

  let baseSlug = slugify(this.name, { lower: true, trim: true });
  let slug = baseSlug;
  let count = 1;

  const Family = mongoose.model("Family");

  // Keep checking if a family with this slug already exists
  while (await Family.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
  next();
});

// Virtual for member count
FamilySchema.virtual("memberCount").get(function () {
  return this.members ? this.members.length : 0;
});

// Virtual for user count
FamilySchema.virtual("userCount").get(function () {
  return this.users ? this.users.length : 0;
});

// Method to check if a user is a member of this family
FamilySchema.methods.hasMember = function (userId) {
  return this.users.some((user) => user.toString() === userId.toString());
};

// Method to check if a user is the manager of this family
FamilySchema.methods.isManager = function (userId) {
  return this.manager.toString() === userId.toString();
};

// Create model from schema
const Family = mongoose.model("Family", FamilySchema);

module.exports = Family;
