const mongoose = require("mongoose");
require("dotenv").config();
const Campaign = require("./models/Campaign");

const renderCampaigns = [
  {
    _id: "6a3116556c06305f53248cbe",
    title: "Food Support",
    description: "Help needy families",
    goalAmount: 50000,
    raisedAmount: 500,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
    category: "Food",
    createdBy: "Organization",
  },
  {
    _id: "6a34c83ba1cf88e7e75f4131",
    title: "education",
    description: "study students",
    goalAmount: 50000,
    raisedAmount: 0,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    category: "Education",
    createdBy: "Organization",
  },
  {
    _id: "6a34d95f25cb936b2db38763",
    title: "hospital",
    description: "cancer",
    goalAmount: 75000,
    raisedAmount: 0,
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309",
    category: "Medical",
    createdBy: "Organization",
  },
  {
    _id: "6a34e5a04446061cc853ca4e",
    title: "education",
    description: "study",
    goalAmount: 50000,
    raisedAmount: 1005000,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    category: "Education",
    createdBy: "Organization",
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-donation-platform";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding campaigns...");

    for (const c of renderCampaigns) {
      await Campaign.findByIdAndUpdate(c._id, c, { upsert: true, new: true });
    }

    console.log("✓ Successfully seeded 4 campaigns into local MongoDB!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
