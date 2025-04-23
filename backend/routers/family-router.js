// backend/routers/family-router.js
const express = require("express");
const router = express.Router();
const familyController = require("../controllers/family-controller");
const {
  protect,
  authorize,
  isFamilyManager,
  belongsToFamily,
} = require("../middleware/auth");

// Get current user's family
router.get("/my-family", protect, familyController.getMyFamily);

// Family management (family manager only)
router.put(
  "/my-family",
  protect,
  isFamilyManager,
  familyController.updateMyFamily
);

// Family member management
router.post(
  "/my-family/members",
  protect,
  isFamilyManager,
  familyController.addFamilyMember
);
router.put(
  "/my-family/members/:memberId",
  protect,
  isFamilyManager,
  familyController.updateFamilyMember
);
router.delete(
  "/my-family/members/:memberId",
  protect,
  isFamilyManager,
  familyController.deleteFamilyMember
);

// Family invitation
router.post(
  "/invite",
  protect,
  isFamilyManager,
  familyController.inviteToFamily
);
router.post("/join/:inviteToken", protect, familyController.joinFamily);

// Family transfer ownership
router.put(
  "/transfer-ownership/:userId",
  protect,
  isFamilyManager,
  familyController.transferFamilyOwnership
);

// Admin routes for families
router.get("/", protect, authorize("admin"), familyController.getAllFamilies);
router.get("/:id", protect, authorize("admin"), familyController.getFamilyById);
router.put("/:id", protect, authorize("admin"), familyController.updateFamily);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  familyController.deleteFamily
);

module.exports = router;
