const express = require("express");
const router = express.Router();
const {
  createRental,
  confirmRental,
  returnRental,
  cancelRental,
  getMyRentals,
  getRental,getAgreementPreview
} = require("../controllers/rentalController");
const { protect } = require("../middleware/auth");


// All rental routes are protected
router.use(protect);

router.post("/", createRental);
router.get("/my", getMyRentals);

router.get("/:id", getRental);
router.patch("/:id/confirm", confirmRental);
router.patch("/:id/return", returnRental);
router.patch("/:id/cancel", cancelRental);
router.post("/agreement", protect, getAgreementPreview);

module.exports = router;
