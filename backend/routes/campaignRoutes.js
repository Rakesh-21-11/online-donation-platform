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
    let user;
    if (mongoose.Types.ObjectId.isValid(orgId)) {
      user = await User.findById(orgId);
    }
    const orgName = user ? user.name : orgId;

    const conditions = [{ organizationId: orgId }];
    if (orgName) {
      conditions.push({ createdBy: orgName });
      conditions.push({ organizationId: orgName });
    }
    if (user && user.role === "organization") {
      conditions.push({ createdBy: "Organization" });
    }

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
    const campaign =
      await Campaign.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

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
    await Campaign.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Campaign Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;