const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    reelVideoUrl: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    rentPrice: {
      type: Number,
      required: [true, "Rent price is required"],
      min: [0, "Rent price cannot be negative"],
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, "Deposit cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["books", "electronics", "furniture","stationery", "clothing", "sports", "other"],
    },
    condition: {
      type: String,
      enum: ["new", "like_new", "good", "fair", "old"],
      default: "good",
    },
    usageDuration: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "rented", "sold"],
      default: "available",
    },
  },
  { timestamps: true }
);

// Index for faster searches
productSchema.index({ category: 1, status: 1 });
productSchema.index({ owner: 1 });

module.exports = mongoose.model("Product", productSchema);
