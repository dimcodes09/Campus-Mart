const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    verificationReviewedAt: {
      type: Date,
      default: null,
    },
    studentIdImage: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    points: {
      type: Number,
      default: 84,
      min: 0,
    },
    dayStreak: {
      type: Number,
      default: 1,
      min: 0,
    },
    rewards: {
      type: [
        {
          id: {
            type: String,
            default: "",
          },
          title: {
            type: String,
            default: "",
          },
          description: {
            type: String,
            default: "",
          },
          pointsCost: {
            type: Number,
            default: 0,
            min: 0,
          },
          expiresAt: {
            type: Date,
            default: null,
          },
          used: {
            type: Boolean,
            default: false,
          },
          redeemedAt: {
            type: Date,
            default: null,
          },
        },
      ],
      default: () => [
        {
          id: "free-delivery-50",
          title: "Rs.50 OFF",
          description: "Free Delivery",
          pointsCost: 50,
          expiresAt: new Date("2026-06-11T23:59:59.999Z"),
          used: false,
        },
      ],
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
