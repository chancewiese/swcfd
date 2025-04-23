// backend/controllers/user-controller.js
const User = require("../models/user-model");
const Family = require("../models/family-model");
const FamilyMember = require("../models/family-member-model");

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
    } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If email is being changed, check if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;

    await user.save();

    // Update the corresponding family member if exists
    if (user.family) {
      const familyMember = await FamilyMember.findOne({
        user: user._id,
        family: user.family,
      });

      if (familyMember) {
        if (firstName) familyMember.firstName = firstName;
        if (lastName) familyMember.lastName = lastName;
        if (dateOfBirth) familyMember.dateOfBirth = dateOfBirth;
        if (gender) familyMember.gender = gender;
        await familyMember.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        roles: user.roles,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        roles: user.roles,
        family: user.family,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update user roles
// @route   PUT /api/users/:id/roles
// @access  Private/Admin
exports.updateUserRoles = async (req, res, next) => {
  try {
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        message: "Roles must be provided as an array",
      });
    }

    // Validate roles
    const validRoles = ["user", "familyManager", "admin"];
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));

    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid roles: ${invalidRoles.join(", ")}`,
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update roles
    user.roles = roles;
    await user.save();

    // If removing familyManager role, we need to handle family management
    if (!roles.includes("familyManager") && user.family) {
      const family = await Family.findById(user.family);

      if (family && family.manager.toString() === user._id.toString()) {
        // Find another user in the family with familyManager role
        const familyUsers = await User.find({
          family: user.family,
          roles: "familyManager",
          _id: { $ne: user._id },
        }).sort({ createdAt: 1 });

        if (familyUsers.length > 0) {
          // Assign the oldest family manager as the new manager
          family.manager = familyUsers[0]._id;
          await family.save();
        }
        // If no other family managers, family will remain with this user as manager
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        roles: user.roles,
      },
      message: "User roles updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is a family manager
    if (user.roles.includes("familyManager") && user.family) {
      const family = await Family.findById(user.family);

      if (family && family.manager.toString() === user._id.toString()) {
        // Find another user in the family with familyManager role
        const familyUsers = await User.find({
          family: user.family,
          roles: "familyManager",
          _id: { $ne: user._id },
        }).sort({ createdAt: 1 });

        if (familyUsers.length > 0) {
          // Assign the oldest family manager as the new manager
          family.manager = familyUsers[0]._id;
          await family.save();
        } else {
          // If no other family managers, we need to either delete the family
          // or assign another user as manager (business decision)
          return res.status(400).json({
            success: false,
            message:
              "Cannot delete the only family manager. Assign a new manager first.",
          });
        }
      }
    }

    // Remove user from family members
    if (user.family) {
      const familyMember = await FamilyMember.findOne({
        user: user._id,
        family: user.family,
      });

      if (familyMember) {
        // Option 1: Delete the family member
        await FamilyMember.deleteOne({ _id: familyMember._id });

        // Remove from family's members array
        await Family.updateOne(
          { _id: user.family },
          { $pull: { members: familyMember._id, users: user._id } }
        );
      }
    }

    // Delete the user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
