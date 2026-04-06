// backend/controllers/sponsor-controller.js
const SponsorTier = require("../models/sponsor-tier-model");
const Sponsor = require("../models/sponsor-model");
const fs = require("fs");
const path = require("path");

// Default tiers to seed if none exist
const DEFAULT_TIERS = [
  {
    name: "Gold Sponsor",
    contributionRange: "$1,000+",
    color: "#D4AF37",
    order: 1,
    benefits: [
      "Be the Exclusive sponsor of one of our weekly events",
      "Company banner displayed at the City park for the entire week of Country Fair Days",
      "Company banner displayed all year in the Family Activity Center in South Weber",
      "Company/Name listed on the South Weber City Digital Marquee, South Weber Days Sponsor signs, and Flyers",
    ],
  },
  {
    name: "Silver Sponsor",
    contributionRange: "$500–$999",
    color: "#A8A9AD",
    order: 2,
    benefits: [
      "Company banner displayed at the city park for the entire week of Country Fair Days",
      "Company banner displayed all year in the Family Activity Center in South Weber",
      "Company/Name listed on the South Weber City Digital Marquee, South Weber Days Sponsor signs, and Flyers",
    ],
  },
  {
    name: "Bronze Sponsor",
    contributionRange: "$200–$499",
    color: "#A0522D",
    order: 3,
    benefits: [
      "Company banner displayed at the City park for the entire week of Country Fair Days",
    ],
  },
  {
    name: "Friends of Country Fair Days",
    contributionRange: "$25–$100",
    color: "#5B8A4A",
    order: 4,
    benefits: [
      "Company/Family Name listed on the South Weber City website and SWCFD Sponsor signs",
    ],
  },
  {
    name: "Golf Hole Sponsor",
    contributionRange: "$100",
    description:
      "Set up a Sponsor Table at a golf hole of your choice during the Golf Tournament. Golf holes assigned in order of donations. Monetary and prize donations accepted.",
    color: "#2563EB",
    order: 5,
    benefits: [],
  },
];

// GET /api/sponsors/tiers
exports.getAllTiers = async (req, res) => {
  try {
    let tiers = await SponsorTier.find().sort({ order: 1 });

    // Seed default tiers if none exist
    if (tiers.length === 0) {
      await SponsorTier.insertMany(DEFAULT_TIERS);
      tiers = await SponsorTier.find().sort({ order: 1 });
    }

    // Populate sponsors for each tier
    const tiersWithSponsors = await Promise.all(
      tiers.map(async (tier) => {
        const sponsors = await Sponsor.find({ tierId: tier._id }).sort({
          order: 1,
        });
        return { ...tier.toObject(), sponsors };
      }),
    );

    res.status(200).json({ success: true, data: tiersWithSponsors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/sponsors/tiers
exports.createTier = async (req, res) => {
  try {
    const { name, contributionRange, description, benefits, color, order } =
      req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    const tier = new SponsorTier({
      name: name.trim(),
      contributionRange: contributionRange || "",
      description: description || "",
      benefits: benefits || [],
      color: color || "#1976d2",
      order: order !== undefined ? order : 0,
    });
    await tier.save();
    res.status(201).json({ success: true, data: tier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/sponsors/tiers/:tierId
exports.updateTier = async (req, res) => {
  try {
    const { tierId } = req.params;
    const { name, contributionRange, description, benefits, color } = req.body;
    const tier = await SponsorTier.findById(tierId);
    if (!tier) {
      return res
        .status(404)
        .json({ success: false, message: "Tier not found" });
    }
    if (name !== undefined) tier.name = name.trim();
    if (contributionRange !== undefined)
      tier.contributionRange = contributionRange;
    if (description !== undefined) tier.description = description;
    if (benefits !== undefined) tier.benefits = benefits;
    if (color !== undefined) tier.color = color;
    await tier.save();
    res.status(200).json({ success: true, data: tier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/sponsors/tiers/:tierId
exports.deleteTier = async (req, res) => {
  try {
    const { tierId } = req.params;
    const tier = await SponsorTier.findById(tierId);
    if (!tier) {
      return res
        .status(404)
        .json({ success: false, message: "Tier not found" });
    }

    // Find and delete all sponsors in this tier, removing logo files
    const sponsors = await Sponsor.find({ tierId });
    for (const sponsor of sponsors) {
      if (sponsor.logoUrl) {
        try {
          const filename = path.basename(sponsor.logoUrl);
          const absolutePath = path.join(
            __dirname,
            "../images/sponsors",
            filename,
          );
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        } catch (fileErr) {
          console.error("Error deleting sponsor logo file:", fileErr);
        }
      }
    }
    await Sponsor.deleteMany({ tierId });

    await SponsorTier.findByIdAndDelete(tierId);
    res
      .status(200)
      .json({ success: true, message: "Tier and its sponsors deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/sponsors/tiers/:tierId/entries
exports.addSponsor = async (req, res) => {
  try {
    const { tierId } = req.params;
    const tier = await SponsorTier.findById(tierId);
    if (!tier) {
      return res
        .status(404)
        .json({ success: false, message: "Tier not found" });
    }
    const { name, website, order } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    const count = await Sponsor.countDocuments({ tierId });
    const sponsor = new Sponsor({
      name: name.trim(),
      tierId,
      website: website || "",
      order: order !== undefined ? order : count,
    });
    await sponsor.save();
    res.status(201).json({ success: true, data: sponsor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/sponsors/entries/:sponsorId
exports.updateSponsor = async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const sponsor = await Sponsor.findById(sponsorId);
    if (!sponsor) {
      return res
        .status(404)
        .json({ success: false, message: "Sponsor not found" });
    }
    const { name, website } = req.body;
    if (name !== undefined) sponsor.name = name.trim();
    if (website !== undefined) sponsor.website = website;
    await sponsor.save();
    res.status(200).json({ success: true, data: sponsor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/sponsors/entries/:sponsorId
exports.deleteSponsor = async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const sponsor = await Sponsor.findById(sponsorId);
    if (!sponsor) {
      return res
        .status(404)
        .json({ success: false, message: "Sponsor not found" });
    }
    // Delete logo file from disk if it exists
    if (sponsor.logoUrl) {
      try {
        const filename = path.basename(sponsor.logoUrl);
        const absolutePath = path.join(
          __dirname,
          "../images/sponsors",
          filename,
        );
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      } catch (fileErr) {
        console.error("Error deleting sponsor logo file:", fileErr);
      }
    }
    await Sponsor.findByIdAndDelete(sponsorId);
    res.status(200).json({ success: true, message: "Sponsor deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/sponsors/entries/:sponsorId/logo
exports.uploadSponsorLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No logo file provided" });
    }
    const { sponsorId } = req.params;
    const sponsor = await Sponsor.findById(sponsorId);
    if (!sponsor) {
      return res
        .status(404)
        .json({ success: false, message: "Sponsor not found" });
    }

    // Delete old logo file if it exists
    if (sponsor.logoUrl) {
      try {
        const oldFilename = path.basename(sponsor.logoUrl);
        const oldPath = path.join(
          __dirname,
          "../images/sponsors",
          oldFilename,
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (fileErr) {
        console.error("Error deleting old logo:", fileErr);
      }
    }

    sponsor.logoUrl = `/images/sponsors/${req.file.filename}`;
    await sponsor.save();
    res.status(200).json({ success: true, data: sponsor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
