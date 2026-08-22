const express = require("express");
const User = require("../models/User");
const Campaign =
require("../models/Campaign");
const Donation =
require("../models/Donation");

const router = express.Router();

router.get("/", async (
  req,
  res
) => {
  try {

    const users =
      await User.countDocuments();

    const campaigns =
      await Campaign.countDocuments();

    const donations =
      await Donation.countDocuments();

    const donationData =
      await Donation.find();

    const totalRaised =
      donationData.reduce(
        (sum, d) =>
          sum + d.amount,
        0
      );

    res.json({
      users,
      campaigns,
      donations,
      totalRaised,
    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }
});

module.exports = router;