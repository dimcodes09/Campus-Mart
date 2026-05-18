const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const {
  uploadOriginalCondition,
  uploadCurrentCondition,
  getRentalCondition,
} = require("../controllers/conditionController");

const router = express.Router();

// Memory storage — buffers passed to Cloudinary directly (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB per image
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// POST /api/condition/original/:rentalId  — seller uploads original images
router.post(
  "/original/:rentalId",
  protect,
  upload.array("images", 5),   // max 5 images
  uploadOriginalCondition
);

// POST /api/condition/current/:rentalId  — buyer uploads current images
router.post(
  "/current/:rentalId",
  protect,
  upload.array("images", 5),
  uploadCurrentCondition
);

// GET /api/condition/rental/:rentalId    — view both image sets
router.get("/rental/:rentalId", protect, getRentalCondition);

module.exports = router;
