const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getCampaignRecommendations } = require("../services/aiRecommendationService");

const router = express.Router();

/**
 * POST /api/ai/recommend-campaigns
 * Recommend campaigns based on donor interests and query string
 */
router.post("/recommend-campaigns", authMiddleware, async (req, res) => {
  try {
    const { interests = [], query = "" } = req.body;

    // Validate that interests is an array if passed
    if (!Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        message: "Interests must be an array of strings",
      });
    }

    // Call recommendation service
    const recommendations = await getCampaignRecommendations(interests, query);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating campaign recommendations.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
