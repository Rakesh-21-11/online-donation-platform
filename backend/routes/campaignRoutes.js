const express = require("express");
const mongoose = require("mongoose");
const Campaign = require("../models/Campaign");
const User = require("../models/User");

const router = express.Router();


// CREATE CAMPAIGN
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      goalAmount,
      image,
      category,
      organizationId,
      createdBy,
    } = req.body;

    const campaign = await Campaign.create({
      title,
      description,
      goalAmount,
      image,
      category,
      organizationId,
      createdBy: createdBy || "Organization",
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// GET CAMPAIGNS FOR AN ORGANIZATION
router.get("/organization/:id", async (req, res) => {
  try {
    const orgId = req.params.id;
    const conditions = [];

    if (mongoose.Types.ObjectId.isValid(orgId)) {
      conditions.push({ organizationId: orgId });
      const user = await User.findById(orgId);
      if (user && user.name) {
        conditions.push({ createdBy: user.name });
      }
    } else {
      conditions.push({ createdBy: orgId });
    }

    conditions.push({ createdBy: "Organization" });

    const campaigns = await Campaign.find({ $or: conditions }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET ALL CAMPAIGNS
router.get("/", async (req, res) => {
  try {
    // Auto-sync missing campaigns from Render
    try {
      const renderRes = await fetch("https://online-donation-platform-x9rc.onrender.com/api/campaigns");
      if (renderRes.ok) {
        const renderCampaigns = await renderRes.json();
        for (const c of renderCampaigns) {
          const exists = await Campaign.findById(c._id);
          if (!exists) {
            await Campaign.create({
              _id: c._id,
              title: c.title,
              description: c.description || "Campaign description",
              goalAmount: c.goalAmount || 50000,
              raisedAmount: c.raisedAmount || 0,
              image: c.image || "",
              category: c.category || "General",
              organizationId: c.organizationId,
              createdBy: c.createdBy || "Organization",
            });
          }
        }
      }
    } catch (err) {
      console.error("Auto-sync campaigns error:", err.message);
    }

    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// GET SINGLE CAMPAIGN
router.get("/:id", async (req, res) => {
  try {
    const campaign =
      await Campaign.findById(req.params.id);

    res.json(campaign);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// UPDATE CAMPAIGN
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let campaign = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      campaign = await Campaign.findByIdAndUpdate(id, req.body, { new: true });
    }

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// DELETE CAMPAIGN
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let deleted = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Campaign.findByIdAndDelete(id);
    }

    if (!deleted) {
      return res.status(404).json({ message: "Campaign not found or already deleted" });
    }

    res.json({
      success: true,
      message: "Campaign Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;