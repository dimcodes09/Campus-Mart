const mongoose = require("mongoose");

// Sub-schema for condition images
const conditionImageSchema = new mongoose.Schema(
  {
    url:        { type: String, required: true },  // Cloudinary secure_url
    publicId:   { type: String, required: true },  // Cloudinary public_id
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const rentalSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    deposit: {
      type: Number,
      required: [true, "Deposit amount is required"],
      min: [0, "Deposit cannot be negative"],
    },
    agreementText: {
      type: String,
      default: "",
    },
    agreementId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },

    // ── Condition Tracking (NEW) ────────────────────────────
    originalImages: {           // Uploaded by SELLER before renting out
      type: [conditionImageSchema],
      default: [],
    },
    currentImages: {            // Uploaded by BUYER when rental goes active
      type: [conditionImageSchema],
      default: [],
    },
    originalImagesUploadedAt: { type: Date, default: null },
    currentImagesUploadedAt:  { type: Date, default: null },
    // ────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

// Validate endDate > startDate
rentalSchema.pre("save", function () {
  if (this.endDate <= this.startDate) {
    throw new Error("End date must be after start date");
  }
});

rentalSchema.index({ renterId: 1, status: 1 });
rentalSchema.index({ productId: 1 });

module.exports = mongoose.model("Rental", rentalSchema);