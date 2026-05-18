const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getMyProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  markStatus,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");

router.get("/", getAllProducts);
router.post("/", protect, createProduct);

router.get("/my", protect, getMyProducts);
router.get("/:id", getProduct);
router.put("/:id", protect, updateProduct);
router.patch("/:id/status", protect, markStatus);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
