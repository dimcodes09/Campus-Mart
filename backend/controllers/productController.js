const Product = require("../models/Product");

// @route  POST /api/products
// @access Private
const createProduct = async (req, res, next) => {
  try {

    // ✅ ADDED (as asked)
    if (!req.user.isVerified)
      return res.status(403).json({ message: "Only verified students can perform this action" });

    const { title, description, imageUrl, reelVideoUrl, price, rentPrice, deposit, category, condition, usageDuration } = req.body;

    const product = await Product.create({
      title,
      description,
      imageUrl,
      reelVideoUrl,
      price,
      rentPrice,
      deposit,
      category,
      condition,
      usageDuration,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/products
// @access Public
const getAllProducts = async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("owner", "name email rating")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/products/:id
// @access Public
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "owner",
      "name email rating"
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/products/:id
// @access Private (owner only)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this product." });
    }

    const allowed = ["title", "description", "imageUrl", "reelVideoUrl", "price", "rentPrice", "deposit", "category", "status", "condition", "usageDuration"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/products/:id
// @access Private (owner only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this product." });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct };