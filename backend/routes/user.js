const express = require("express");
const router = express.Router();
const { getRewards, redeemReward } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.get("/rewards", protect, getRewards);
router.post("/redeem", protect, redeemReward);

module.exports = router;
