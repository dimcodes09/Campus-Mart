const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper to generate a signed JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Helper to send token response
const sendTokenResponse = (res, user, statusCode) => {
  const token = signToken(user._id);
  user.password = undefined; // ensure password is stripped

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide name, email and password." });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(res, user, 201);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    sendTokenResponse(res, user, 200);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

const verifyStudent = async (req, res) => {
  try {
    const { studentIdImage } = req.body;
    if (!studentIdImage) {
      return res.status(400).json({ success: false, message: "Image is required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Student is already verified." });
    }

    user.studentIdImage = studentIdImage;
    user.isVerified = false;
    user.verificationStatus = "pending";
    user.verificationReviewedAt = null;
    await user.save();

    user.password = undefined;

    res.json({
      success: true,
      message: "Verification request submitted for admin review.",
      user,
    });
  } catch {
    res.status(500).json({ success: false, message: "Verification failed." });
  }
};

module.exports = { register, login, getMe, verifyStudent };
