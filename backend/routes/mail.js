const express = require("express");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

router.post("/product-found", async (req, res, next) => {
  try {
    const {
      to,
      subject = "Product Found",
      text = "the product is in your budget 2000",
    } = req.body || {};

    if (!to) {
      return res.status(400).json({ success: false, message: "Recipient email is required" });
    }

    await sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
    });

    res.status(200).json({ success: true, message: "Mail sent" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
