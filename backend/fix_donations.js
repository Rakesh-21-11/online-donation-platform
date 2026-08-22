const mongoose = require("mongoose");
require("dotenv").config();
const Donation = require("./models/Donation");
const User = require("./models/User");

async function fixData() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-donation-platform";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    // Update any existing donations to ensure donorName is properly set
    const result = await Donation.updateMany(
      { paymentStatus: "SUCCESS" },
      { $set: { donorName: "lucky" } }
    );
    console.log("Updated donations count:", result.modifiedCount);

    const donations = await Donation.find();
    console.log("Updated Donations in DB:", JSON.stringify(donations, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Fix error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixData();
