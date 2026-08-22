const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User");

async function createSampleOrg2() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-donation-platform";
    await mongoose.connect(mongoUri);

    const email = "greenearth@donationhub.com";
    let orgUser = await User.findOne({ email });

    if (!orgUser) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      orgUser = await User.create({
        name: "Green Earth Society",
        organizationName: "Green Earth Society",
        email: email,
        password: hashedPassword,
        role: "organization",
      });
      console.log("✓ Sample Organization #2 Created!");
    } else {
      console.log("✓ Sample Organization #2 Already Exists!");
    }

    console.log("Email:", email);
    console.log("Password: password123");
    console.log("Org ID:", orgUser._id);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createSampleOrg2();
