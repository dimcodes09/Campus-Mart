const { askGroq } = require("./groqClient");
const {
  pricePrompt,
  descriptionPrompt,
  searchPrompt,
  chatPrompt,
} = require("./prompts");

// POST /api/ai/price-recommendation
const getPriceRecommendation = async (req, res) => {
  const { title, category } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: "title and category are required" });
  }

  try {
    const result = await askGroq(pricePrompt({ title, category }), 0.4);
    res.json(result);
  } catch (err) {
    console.error("[AI/price]", err.message);
    res.status(500).json({ error: "AI price recommendation failed" });
  }
};

// POST /api/ai/generate-description
const generateDescription = async (req, res) => {
  const { title, category, condition, usageDuration } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: "title and category are required" });
  }

  try {
    const result = await askGroq(
      descriptionPrompt({ title, category, condition, usageDuration }),
      0.8
    );
    res.json(result);
  } catch (err) {
    console.error("[AI/description]", err.message);
    res.status(500).json({ error: "AI description generation failed" });
  }
};

// POST /api/ai/search
const parseSearchQuery = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const result = await askGroq(searchPrompt(query), 0.3);
    res.json(result);
  } catch (err) {
    console.error("[AI/search]", err.message);
    res.status(500).json({ error: "AI search parsing failed" });
  }
};

// POST /api/ai/chat
const chatWithBot = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const result = await askGroq(chatPrompt(message), 0.7);
    res.json(result);
  } catch (err) {
    console.error("[AI/chat]", err.message);
    res.status(500).json({ error: "AI chat failed" });
  }
};

module.exports = {
  getPriceRecommendation,
  generateDescription,
  parseSearchQuery,
  chatWithBot,
};
