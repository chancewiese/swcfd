// backend/controllers/registration-controller.js
const Registration = require("../models/registration-model");
const Event = require("../models/event-model");
const EventSection = require("../models/event-section-model");
const FamilyMember = require("../models/family-member-model");

// Create a new registration
exports.createRegistration = async (req, res) => {
  try {
    const {
      eventSlug,
      eventSectionId,
      teamName,
      teamMembers,
      contactEmail,
      contactPhone,
    } = req.body;

    // Find the event
    const event = await Event.findOne({ titleSlug: eventSlug });
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Find the section
    const section = await EventSection.findById(eventSectionId);
    if (!section) {
      return res.status(404).json({ success: false, message: "Division not found" });
    }

    // Check capacity
    if (section.capacity || section.maxTeams) {
      const maxTeams = section.capacity || section.maxTeams;
      const existing = await Registration.countDocuments({
        eventSection: eventSectionId,
        status: { $ne: "cancelled" },
      });
      if (existing >= maxTeams) {
        return res.status(400).json({ success: false, message: "This division is full" });
      }
    }

    // Prevent duplicate registration for the same section by the same family
    if (req.user.family) {
      const duplicate = await Registration.findOne({
        eventSection: eventSectionId,
        family: req.user.family,
        status: { $ne: "cancelled" },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Your family already has a registration for this division",
        });
      }
    }

    const registration = await Registration.create({
      event: event._id,
      eventSection: eventSectionId,
      registeredBy: req.user._id,
      family: req.user.family || null,
      registrationType: "team",
      teamName,
      teamMembers,
      contactEmail: contactEmail || req.user.email,
      contactPhone: contactPhone || req.user.phone || "",
      status: "pending",
      paymentStatus: "unpaid",
    });

    // Populate for response
    const populated = await Registration.findById(registration._id)
      .populate("event", "title titleSlug startDate endDate")
      .populate("eventSection", "title tournamentDate price capacity maxTeams")
      .populate("registeredBy", "firstName lastName email")
      .populate("family", "name")
      .populate("teamMembers.familyMember", "firstName lastName");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("Create registration error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get current user's registrations
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      registeredBy: req.user._id,
    })
      .populate("event", "title titleSlug startDate endDate")
      .populate("eventSection", "title tournamentDate price capacity maxTeams")
      .populate("teamMembers.familyMember", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get registrations for a specific section (admin)
exports.getRegistrationsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const registrations = await Registration.find({ eventSection: sectionId })
      .populate("registeredBy", "firstName lastName email phone")
      .populate("family", "name")
      .populate("teamMembers.familyMember", "firstName lastName dateOfBirth gender")
      .populate("teamMembers.user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get registration count for a section (public)
exports.getSectionRegistrationCount = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const count = await Registration.countDocuments({
      eventSection: sectionId,
      status: { $ne: "cancelled" },
    });
    res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all registrations (admin)
exports.getAllRegistrations = async (req, res) => {
  try {
    const { eventSlug } = req.query;
    const filter = {};

    if (eventSlug) {
      const event = await Event.findOne({ titleSlug: eventSlug });
      if (event) filter.event = event._id;
    }

    const registrations = await Registration.find(filter)
      .populate("event", "title titleSlug")
      .populate("eventSection", "title")
      .populate("registeredBy", "firstName lastName email")
      .populate("family", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single registration
exports.getRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("event", "title titleSlug startDate endDate location pricePerTeam")
      .populate("eventSection", "title tournamentDate tournamentTime price capacity maxTeams")
      .populate("registeredBy", "firstName lastName email phone")
      .populate("family", "name")
      .populate("teamMembers.familyMember", "firstName lastName dateOfBirth gender")
      .populate("teamMembers.user", "firstName lastName email");

    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    // Only allow owner or admin
    const isOwner = registration.registeredBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.roles && req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, data: registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update registration (admin: status/payment; owner: teamName/members before confirmed)
exports.updateRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    const isOwner = registration.registeredBy.toString() === req.user._id.toString();
    const isAdmin = req.user.roles && req.user.roles.includes("admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Owners can only update certain fields before registration is confirmed
    if (isOwner && !isAdmin) {
      if (registration.status === "confirmed") {
        return res.status(400).json({
          success: false,
          message: "Cannot modify a confirmed registration. Contact the organizer.",
        });
      }
      const { teamName, teamMembers, contactEmail, contactPhone } = req.body;
      if (teamName !== undefined) registration.teamName = teamName;
      if (teamMembers !== undefined) registration.teamMembers = teamMembers;
      if (contactEmail !== undefined) registration.contactEmail = contactEmail;
      if (contactPhone !== undefined) registration.contactPhone = contactPhone;
    } else {
      // Admin can update any field
      const allowedFields = [
        "teamName", "teamMembers", "status", "paymentStatus",
        "contactEmail", "contactPhone", "notes"
      ];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) registration[field] = req.body[field];
      });
    }

    await registration.save();

    const updated = await Registration.findById(registration._id)
      .populate("event", "title titleSlug")
      .populate("eventSection", "title tournamentDate price")
      .populate("registeredBy", "firstName lastName email")
      .populate("family", "name")
      .populate("teamMembers.familyMember", "firstName lastName");

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel registration
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    const isOwner = registration.registeredBy.toString() === req.user._id.toString();
    const isAdmin = req.user.roles && req.user.roles.includes("admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    registration.status = "cancelled";
    await registration.save();

    res.status(200).json({ success: true, data: { message: "Registration cancelled" } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
