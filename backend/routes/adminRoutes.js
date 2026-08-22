const express = require("express");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    const donations = await Donation.find();

    res.json({
      totalCampaigns: campaigns.length,
      totalDonations: donations.length,
      campaigns,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;