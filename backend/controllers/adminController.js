const User = require("../models/User");

const verificationFields =
  "name email role isVerified verificationStatus verificationReviewedAt studentIdImage createdAt updatedAt";

const getVerifications = async (req, res, next) => {
  try {
    const verifications = await User.find({
      verificationStatus: "pending",
      studentIdImage: { $ne: "" },
    })
      .select(verificationFields)
      .sort({ updatedAt: 1 });

    res.status(200).json({ success: true, verifications });
  } catch (error) {
    next(error);
  }
};

const approveVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(verificationFields);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!user.studentIdImage) {
      return res.status(400).json({ success: false, message: "No student ID image submitted." });
    }

    user.isVerified = true;
    user.verificationStatus = "approved";
    user.verificationReviewedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Student verification approved.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const rejectVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(verificationFields);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.isVerified = false;
    user.verificationStatus = "rejected";
    user.verificationReviewedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Student verification rejected.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVerifications, approveVerification, rejectVerification };
