const express = require("express");
const {
  approveVerification,
  getVerifications,
  rejectVerification,
} = require("../controllers/adminController");
const { adminOnly, protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/verifications", getVerifications);
router.patch("/verify/:id", approveVerification);
router.patch("/reject/:id", rejectVerification);

module.exports = router;
