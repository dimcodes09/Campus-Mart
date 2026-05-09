const express = require("express");
const {
  getPriceRecommendation,
  generateDescription,
  parseSearchQuery,
  chatWithBot,
} = require("./aiController");

const router = express.Router();

router.post("/price-recommendation", getPriceRecommendation);
router.post("/generate-description", generateDescription);
router.post("/search", parseSearchQuery);
router.post("/chat", chatWithBot);

module.exports = router;
