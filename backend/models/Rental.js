const mongoose = require("mongoose");

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
    // In your existing Rental schema, add:
agreementText: { 
  type: String, default: "" 
},
agreementId:   { 
  type: String, default: ""
 },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
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
