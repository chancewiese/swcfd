// backend/controllers/family-controller.js
const User = require("../models/user-model");
const Family = require("../models/family-model");
const FamilyMember = require("../models/family-member-model");
const crypto = require("crypto");
const slugify = require("slugify");

// @desc    Get current user's family
// @route   GET /api/families/my-family
// @access  Private
exports.getMyFamily = async (req, res, next) => {
  try {
    // Find user's family
    const user = await User.findById(req.user.id);

    if (!user || !user.family) {
      return res.status(404).json({
        success: false,
        message: "Family not found for this user",
      });
    }

    // Get the family with members
    const family = await Family.findById(user.family).populate({
      path: "members",
      select: "firstName lastName dateOfBirth gender user",
      populate: {
        path: "user",
        select: "email",
      },
    });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    res.status(200).json({
      success: true,
      data: family,
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

// @desc    Update my family
// @route   PUT /api/families/my-family
// @access  Private/FamilyManager
exports.updateMyFamily = async (req, res, next) => {
  try {
    const { name, address, phoneNumber, notes } = req.body;

    // Get the user's family
    const user = await User.findById(req.user.id);

    if (!user || !user.family) {
      return res.status(404).json({
        success: false,
        message: "Family not found for this user",
      });
    }

    // Find the family
    const family = await Family.findById(user.family);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    // Check if user is the family manager
    if (
      family.manager.toString() !== user._id.toString() &&
      !user.roles.includes("admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the family manager can update family details",
      });
    }

    // Update family fields
    if (name) {
      family.name = name;
      // Slug will be automatically updated due to the schema setter
    }
    if (address) family.address = address;
    if (phoneNumber) family.phoneNumber = phoneNumber;
    if (notes) family.notes = notes;

    await family.save();

    res.status(200).json({
      success: true,
      data: family,
      message: "Family updated successfully",
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

// @desc    Add family member
// @route   POST /api/families/my-family/members
// @access  Private/FamilyManager
exports.addFamilyMember = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      email,
      address,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required",
      });
    }

    // Get the user's family
    const user = await User.findById(req.user.id);

    if (!user || !user.family) {
      return res.status(404).json({
        success: false,
        message: "Family not found for this user",
      });
    }

    // Find the family to get manager info - we'll use this for defaults if needed
    const family = await Family.findById(user.family).populate({
      path: "manager",
      select: "firstName lastName email phoneNumber address",
    });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    // Create new family member with provided info
    const familyMember = new FamilyMember({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      family: user.family,
    });

    // For phone and address, use provided values or inherit from family manager
    if (phoneNumber) {
      familyMember.phoneNumber = phoneNumber;
    }

    if (address && address.street) {
      familyMember.address = address;
    }

    await familyMember.save();

    // Add member to family
    await Family.findByIdAndUpdate(user.family, {
      $push: { members: familyMember._id },
    });

    res.status(201).json({
      success: true,
      data: familyMember,
      message: "Family member added successfully",
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

// @desc    Update family member
// @route   PUT /api/families/my-family/members/:memberId
// @access  Private/FamilyManager
exports.updateFamilyMember = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      email,
      address,
    } = req.body;
    const memberId = req.params.memberId;

    // Get the user's family
    const user = await User.findById(req.user.id);

    if (!user || !user.family) {
      return res.status(404).json({
        success: false,
        message: "Family not found for this user",
      });
    }

    // Find the family member
    const familyMember = await FamilyMember.findOne({
      _id: memberId,
      family: user.family,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Update family member fields
    if (firstName) familyMember.firstName = firstName;
    if (lastName) familyMember.lastName = lastName;
    if (dateOfBirth) familyMember.dateOfBirth = dateOfBirth;
    if (gender) familyMember.gender = gender;
    if (email) familyMember.email = email;

    // Only update phone if provided (empty string means intentionally clearing)
    if (phoneNumber !== undefined) {
      familyMember.phoneNumber = phoneNumber;
    }

    // Only update address if provided (empty object or street means intentionally clearing)
    if (address !== undefined) {
      familyMember.address = address;
    }

    await familyMember.save();

    // If this family member has a user account, update that too
    if (familyMember.user) {
      const memberUser = await User.findById(familyMember.user);
      if (memberUser) {
        if (firstName) memberUser.firstName = firstName;
        if (lastName) memberUser.lastName = lastName;
        if (dateOfBirth) memberUser.dateOfBirth = dateOfBirth;
        if (gender) memberUser.gender = gender;
        if (email) memberUser.email = email;
        if (phoneNumber !== undefined) memberUser.phoneNumber = phoneNumber;
        if (address !== undefined) memberUser.address = address;
        await memberUser.save();
      }
    }

    res.status(200).json({
      success: true,
      data: familyMember,
      message: "Family member updated successfully",
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

// @desc    Delete family member
// @route   DELETE /api/families/my-family/members/:memberId
// @access  Private/FamilyManager
exports.deleteFamilyMember = async (req, res, next) => {
  try {
    const memberId = req.params.memberId;

    // Get the user's family
    const user = await User.findById(req.user.id);

    if (!user || !user.family) {
      return res.status(404).json({
        success: false,
        message: "Family not found for this user",
      });
    }

    // Find the family member
    const familyMember = await FamilyMember.findOne({
      _id: memberId,
      family: user.family,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Check if this family member is also a user account
    // We don't want to delete the user, just unlink them from the family member
    if (familyMember.user) {
      // Check if this is the only family manager
      const memberUser = await User.findById(familyMember.user);

      if (memberUser && memberUser.roles.includes("familyManager")) {
        const familyManagers = await User.countDocuments({
          family: user.family,
          roles: "familyManager",
        });

        if (familyManagers <= 1) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot delete the only family manager. Assign a new manager first.",
          });
        }
      }

      // Unlink the user from this family member
      await User.findByIdAndUpdate(familyMember.user, {
        $unset: { family: "" },
      });
    }

    // Remove from family's members array
    await Family.findByIdAndUpdate(user.family, {
      $pull: { members: familyMember._id },
    });

    // Delete the family member
    await FamilyMember.deleteOne({ _id: familyMember._id });

    res.status(200).json({
      success: true,
      message: "Family member deleted successfully",
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

// @desc    Invite user to family
// @route   POST /api/families/invite
// @access  Private/FamilyManager
exports.inviteToFamily = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Get the user's family
    const user = await User.findById(req.user.id);

    if (!user || !user.family) {
      return res.status(404).json({
        success: false,
        message: "Family not found for this user",
      });
    }

    // Find the family
    const family = await Family.findById(user.family);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    // Check if user is the family manager
    if (
      family.manager.toString() !== user._id.toString() &&
      !user.roles.includes("admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the family manager can send invitations",
      });
    }

    // Check if the invited user exists
    const invitedUser = await User.findOne({ email });

    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Check if the user is already in a family
    if (invitedUser.family) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of another family",
      });
    }

    // Generate a unique invitation token
    const inviteToken = crypto.randomBytes(20).toString("hex");

    // Store invitation in the family (could be moved to a separate model)
    family.invitations = family.invitations || [];
    family.invitations.push({
      email,
      token: inviteToken,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await family.save();

    // Create invite URL
    const inviteUrl = `${req.protocol}://${req.get(
      "host"
    )}/join-family/${inviteToken}`;

    // Here you would normally send an email with the invitation URL
    console.log(`Invitation URL: ${inviteUrl}`);

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      // For development purposes, include invitation URL in response
      inviteUrl: process.env.NODE_ENV === "development" ? inviteUrl : undefined,
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

// @desc    Join family with invitation token
// @route   POST /api/families/join/:inviteToken
// @access  Private
exports.joinFamily = async (req, res, next) => {
  try {
    const { inviteToken } = req.params;

    // Find family with this invitation token
    const family = await Family.findOne({
      "invitations.token": inviteToken,
      "invitations.expires": { $gt: Date.now() },
    });

    if (!family) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invitation",
      });
    }

    // Get the invitation
    const invitation = family.invitations.find(
      (inv) => inv.token === inviteToken
    );

    // Get the user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user email matches invitation email
    if (user.email !== invitation.email) {
      return res.status(400).json({
        success: false,
        message: "This invitation is for a different email address",
      });
    }

    // Check if user is already in a family
    if (user.family) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of a family",
      });
    }

    // Add user to family
    family.users.push(user._id);

    // Remove the invitation
    family.invitations = family.invitations.filter(
      (inv) => inv.token !== inviteToken
    );

    await family.save();

    // Update user with family reference
    user.family = family._id;
    await user.save();

    // Create a family member entry for the user
    const familyMember = new FamilyMember({
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      user: user._id,
      family: family._id,
    });

    await familyMember.save();

    // Add the family member to the family
    family.members.push(familyMember._id);
    await family.save();

    res.status(200).json({
      success: true,
      data: {
        family: {
          id: family._id,
          name: family.name,
        },
      },
      message: "Successfully joined family",
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

// @desc    Transfer family ownership
// @route   PUT /api/families/transfer-ownership/:userId
// @access  Private/FamilyManager
exports.transferFamilyOwnership = async (req, res, next) => {
  try {
    const newManagerId = req.params.userId;

    // Get the current user (family manager)
    const currentManager = await User.findById(req.user.id);

    if (!currentManager || !currentManager.family) {
      return res.status(404).json({
        success: false,
        message: "Family not found for this user",
      });
    }

    // Find the family
    const family = await Family.findById(currentManager.family);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    // Check if user is the family manager
    if (
      family.manager.toString() !== currentManager._id.toString() &&
      !currentManager.roles.includes("admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the family manager can transfer ownership",
      });
    }

    // Find the new manager
    const newManager = await User.findById(newManagerId);

    if (!newManager) {
      return res.status(404).json({
        success: false,
        message: "New manager not found",
      });
    }

    // Check if new manager is in the same family
    if (
      !newManager.family ||
      newManager.family.toString() !== family._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "New manager must be a member of the same family",
      });
    }

    // Change family manager
    family.manager = newManager._id;
    await family.save();

    // Add familyManager role to new manager if they don't have it
    if (!newManager.roles.includes("familyManager")) {
      newManager.roles.push("familyManager");
      await newManager.save();
    }

    res.status(200).json({
      success: true,
      data: {
        family: family._id,
        manager: newManager._id,
      },
      message: "Family ownership transferred successfully",
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

// @desc    Get all families (admin only)
// @route   GET /api/families
// @access  Private/Admin
exports.getAllFamilies = async (req, res, next) => {
  try {
    const families = await Family.find()
      .populate({
        path: "manager",
        select: "firstName lastName email",
      })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: families.length,
      data: families,
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

// @desc    Get family by ID (admin only)
// @route   GET /api/families/:id
// @access  Private/Admin
exports.getFamilyById = async (req, res, next) => {
  try {
    const family = await Family.findById(req.params.id)
      .populate({
        path: "manager",
        select: "firstName lastName email",
      })
      .populate({
        path: "members",
        select: "firstName lastName dateOfBirth gender user",
        populate: {
          path: "user",
          select: "email",
        },
      })
      .populate({
        path: "users",
        select: "firstName lastName email roles",
      });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    res.status(200).json({
      success: true,
      data: family,
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

// @desc    Update family (admin only)
// @route   PUT /api/families/:id
// @access  Private/Admin
exports.updateFamily = async (req, res, next) => {
  try {
    const { name, manager, address, phoneNumber, notes } = req.body;

    // Find the family
    const family = await Family.findById(req.params.id);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    // Update family fields
    if (name) family.name = name;
    if (address) family.address = address;
    if (phoneNumber) family.phoneNumber = phoneNumber;
    if (notes) family.notes = notes;

    // If changing manager, verify new manager exists and is in the family
    if (manager && manager !== family.manager.toString()) {
      const newManager = await User.findById(manager);

      if (!newManager) {
        return res.status(404).json({
          success: false,
          message: "New manager not found",
        });
      }

      // Check if new manager is in the family
      if (
        !newManager.family ||
        newManager.family.toString() !== family._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "New manager must be a member of the family",
        });
      }

      // Set new manager
      family.manager = newManager._id;

      // Add familyManager role to new manager if they don't have it
      if (!newManager.roles.includes("familyManager")) {
        newManager.roles.push("familyManager");
        await newManager.save();
      }
    }

    await family.save();

    res.status(200).json({
      success: true,
      data: family,
      message: "Family updated successfully",
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

// @desc    Delete family (admin only)
// @route   DELETE /api/families/:id
// @access  Private/Admin
exports.deleteFamily = async (req, res, next) => {
  try {
    const family = await Family.findById(req.params.id);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    // Remove family reference from all users
    await User.updateMany({ family: family._id }, { $unset: { family: "" } });

    // Delete all family members
    await FamilyMember.deleteMany({ family: family._id });

    // Delete the family
    await family.deleteOne();

    res.status(200).json({
      success: true,
      message: "Family deleted successfully",
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
