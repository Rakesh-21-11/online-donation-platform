const express = require("express");
const mongoose = require("mongoose");
const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");

const router = express.Router();

/* ==================================
   CREATE DONATION
================================== */
router.post("/", async (req, res) => {
  try {

    const {
      campaignId,
      campaignTitle,
      donorId,
      donorName,
      amount,
    } = req.body;

    if (
      !campaignId ||
      !campaignTitle ||
      !donorId ||
      !donorName ||
      !amount
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const campaign =
      await Campaign.findById(
        campaignId
      );

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    const donation =
      await Donation.create({
        campaignId,
        campaignTitle,
        donorId,
        donorName,
        amount: Number(amount),
      });

    await Campaign.findByIdAndUpdate(
      campaignId,
      {
        $inc: {
          raisedAmount:
            Number(amount),
        },
      }
    );

    res.status(201).json(
      donation
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });

  }
});

/* ==================================
   RECENT DONATIONS
================================== */
router.get(
  "/recent/all",
  async (req, res) => {
    try {
      const donations =
        await Donation.find()
          .sort({
            createdAt: -1,
          })
          .limit(10);

      res.json(
        donations
      );
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

/* ==================================
   DONATIONS BY USER
================================== */
router.get(
  "/user/:name",
  async (req, res) => {
    try {
      const identifier = req.params.name;
      const regex = new RegExp(`^${identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i");

      const conditions = [
        { donorName: identifier },
        { donorName: regex },
      ];

      if (mongoose.Types.ObjectId.isValid(identifier)) {
        conditions.push({ donorId: identifier });
      }

      const donations = await Donation.find({ $or: conditions }).sort({
        createdAt: -1,
      });

      res.json(donations);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 });

    res.json(donations);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});

/* ==================================
   DONATIONS BY CAMPAIGN
================================== */
router.get(
  "/:campaignId",
  async (req, res) => {
    try {
      const donations =
        await Donation.find({
          campaignId:
            req.params
              .campaignId,
        }).sort({
          createdAt: -1,
        });

      res.json(
        donations
      );
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

module.exports = router;