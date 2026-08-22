const express = require("express");
const mongoose = require("mongoose");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const User = require("../models/User");

const router = express.Router();

/* ==================================
   ORGANIZATION DASHBOARD
================================== */
router.get("/organization/:id", async (req, res) => {
  try {
    const orgId = req.params.id;
    let user;
    if (mongoose.Types.ObjectId.isValid(orgId)) {
      user = await User.findById(orgId);
    }
    const orgName = user ? user.name : orgId;

    const conditions = [{ organizationId: orgId }];
    if (orgName) {
      conditions.push({ createdBy: orgName });
    }

    const campaigns = await Campaign.find({ $or: conditions });
    const campaignIds = campaigns.map((c) => c._id);

    const donations = await Donation.find({
      campaignId: { $in: campaignIds },
      paymentStatus: "SUCCESS",
    }).sort({ createdAt: -1 });

    const totalRaised = campaigns.reduce(
      (sum, campaign) => sum + (campaign.raisedAmount || 0),
      0
    );

    const uniqueDonors = new Set(
      donations.map((d) => (d.donorId ? d.donorId.toString() : d.donorName))
    );

    res.json({
      totalCampaigns: campaigns.length,
      totalRaised,
      totalDonors: uniqueDonors.size,
      recentDonations: donations.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;