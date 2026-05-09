const Rental = require("../models/Rental");
const Product = require("../models/Product");
const User = require("../models/User");
const { generateRentalAgreement } = require("../utils/agreementGenerator");

const { emitToUser } = require("../socket");

const getAgreementPreview = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;

    if (!productId || !startDate || !endDate)
      return res.status(400).json({ message: "productId, startDate, endDate required" });

    const product = await Product.findById(productId).populate("owner", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const renter = await User.findById(req.user._id).select("name email");

    const { agreementText, agreementId } = generateRentalAgreement({
      product,
      renter,
      owner: product.owner,
      startDate,
      endDate,
      deposit: product.deposit || 0,
      rentPerDay: product.rentPrice || product.price,
    });

    res.json({ agreementText, agreementId });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate agreement" });
  }
};

// @route  POST /api/rentals
// @access Private
const createRental = async (req, res, next) => {
  try {

    // ✅ ADDED (as asked)
    if (!req.user.isVerified)
      return res.status(403).json({ message: "Only verified students can perform this action" });

    const { productId, startDate, endDate } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (product.status !== "available") {
      return res.status(400).json({ success: false, message: "Product is not available for rent." });
    }

    if (product.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot rent your own product." });
    }

    const rental = await Rental.create({
      productId,
      renterId: req.user._id,
      startDate,
      endDate,
      deposit: product.deposit,
      status: "pending",

      // ✅ ADDED (as Claude said — NO logic change)
      agreementText: req.body.agreementText,
      agreementId: req.body.agreementId,
    });

    const ownerId = product.owner.toString();
    emitToUser(ownerId, "rental_update", {
      type: "rental_requested",
      rentalId: rental._id.toString(),
      productId: product._id.toString(),
      renterId: req.user._id.toString(),
      status: rental.status,
      createdAt: rental.createdAt,
    });

    res.status(201).json({ success: true, rental });
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/rentals/:id/confirm
// @access Private (product owner only)
const confirmRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id).populate("productId");

    if (!rental) {
      return res.status(404).json({ success: false, message: "Rental not found." });
    }

    if (rental.status !== "pending") {
      return res.status(400).json({ success: false, message: `Cannot confirm a rental with status '${rental.status}'.` });
    }

    const product = rental.productId;
    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the product owner can confirm a rental." });
    }

    rental.status = "active";
    product.status = "rented";
    await Promise.all([rental.save(), product.save()]);

    res.status(200).json({ success: true, rental });
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/rentals/:id/return
// @access Private (renter or product owner)
const returnRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id).populate("productId");

    if (!rental) {
      return res.status(404).json({ success: false, message: "Rental not found." });
    }

    if (rental.status !== "active") {
      return res.status(400).json({ success: false, message: `Cannot return a rental with status '${rental.status}'.` });
    }

    const userId = req.user._id.toString();
    const isRenter = rental.renterId.toString() === userId;
    const isOwner = rental.productId.owner.toString() === userId;

    if (!isRenter && !isOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to complete this rental." });
    }

    rental.status = "completed";
    rental.productId.status = "available";
    await Promise.all([rental.save(), rental.productId.save()]);

    res.status(200).json({ success: true, rental });
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/rentals/:id/cancel
// @access Private (renter only, pending state)
const cancelRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ success: false, message: "Rental not found." });
    }

    if (rental.renterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the renter can cancel this request." });
    }

    if (rental.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending rentals can be cancelled." });
    }

    rental.status = "cancelled";
    await rental.save();

    res.status(200).json({ success: true, rental });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/rentals/my
// @access Private
const getMyRentals = async (req, res, next) => {
  try {
    const { role = "renter" } = req.query;

    let filter = {};
    if (role === "owner") {
      const ownedProducts = await Product.find({ owner: req.user._id }).select("_id");
      const productIds = ownedProducts.map((p) => p._id);
      filter = { productId: { $in: productIds } };
    } else {
      filter = { renterId: req.user._id };
    }

    const rentals = await Rental.find(filter)
      .populate("productId", "title rentPrice deposit category")
      .populate("renterId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: rentals.length, rentals });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/rentals/:id
// @access Private
const getRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("productId", "title description rentPrice deposit category owner")
      .populate("renterId", "name email rating");

    if (!rental) {
      return res.status(404).json({ success: false, message: "Rental not found." });
    }

    const userId = req.user._id.toString();
    const isRenter = rental.renterId._id.toString() === userId;
    const isOwner = rental.productId.owner.toString() === userId;

    if (!isRenter && !isOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to view this rental." });
    }

    res.status(200).json({ success: true, rental });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRental,
  getAgreementPreview,
  confirmRental,
  returnRental,
  cancelRental,
  getMyRentals,
  getRental,
};
