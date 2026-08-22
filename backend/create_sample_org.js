const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User");

async function createSampleOrg() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-donation-platform";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const email = "org@donationhub.com";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("✓ Sample Organization already exists!");
      console.log("Email:", email);
      console.log("Password: password123");
      console.log("Org User ID:", existing._id);
    } else {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const orgUser = await User.create({
        name: "Hope Foundation",
        organizationName: "Hope Foundation",
        email: email,
        password: hashedPassword,
        role: "organization",
      });
      console.log("✓ Sample Organization Created Successfully!");
      console.log("Email:", email);
      console.log("Password: password123");
      console.log("Org User ID:", orgUser._id);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error creating sample org:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createSampleOrg();
